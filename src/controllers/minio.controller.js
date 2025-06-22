import sharp from 'sharp';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { Client as MinioClient } from 'minio';

const minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' || false,
    accessKey: process.env.MINIO_ROOT_USER || 'minio',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'minio123',
    region: process.env.MINIO_REGION || 'us-east-1'
});

const IMAGES_BUCKET = process.env.MINIO_IMAGES_BUCKET || 'images';
const THUMBNAILS_BUCKET = process.env.MINIO_THUMBNAILS_BUCKET || 'thumbnails';
const CACHE_BUCKET = process.env.MINIO_CACHE_BUCKET || 'cache';

function sanitizeFilename(filename) {
    if (!filename) return 'unknown';

    const lastDotIndex = filename.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;

    return baseName
        .replace(/\s+/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 50);
}

async function testMinioConnection() {
    try {
        await minioClient.listBuckets();
        return true;
    } catch (error) {
        console.error('MinIO connection failed:', error.message);
        return false;
    }
}

async function initializeBuckets() {
    const connectionOk = await testMinioConnection();
    if (!connectionOk) return false;

    const buckets = [IMAGES_BUCKET, THUMBNAILS_BUCKET, CACHE_BUCKET];

    for (const bucket of buckets) {
        try {
            const exists = await minioClient.bucketExists(bucket);
            if (!exists) {
                await minioClient.makeBucket(bucket, process.env.MINIO_REGION || 'us-east-1');
            }
        } catch (error) {
            console.error(`Bucket initialization failed for ${bucket}:`, error.message);
            return false;
        }
    }
    return true;
}

initializeBuckets();

// Generate unique path with date structure: YYYY/MM/DD/timestamp_hash_sanitizedname
function generateUniqueImagePath(originalFilename) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const timestamp = now.getTime();

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const sanitizedName = sanitizeFilename(originalFilename);

    return `${year}/${month}/${day}/${timestamp}_${randomSuffix}_${sanitizedName}`;
}

export async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file provided',
                message: 'Please provide an image file'
            });
        }

        // Critical: Verify MinIO connection before processing upload
        try {
            await minioClient.listBuckets();
        } catch (connError) {
            console.error('MinIO connection failed during upload:', connError.message);
            return res.status(503).json({
                error: 'Service temporarily unavailable',
                details: 'Storage service connection failed'
            });
        }

        const originalFilename = req.file.originalname;
        const uniquePath = generateUniqueImagePath(originalFilename);
        const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();

        const uploadDate = new Date().toISOString();

        await minioClient.putObject(
            IMAGES_BUCKET,
            `${uniquePath}.jpg`,
            optimizedBuffer,
            optimizedBuffer.length,
            {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000'
            }
        );

        const thumbnailSizes = [150, 300, 600];
        const thumbnailPromises = thumbnailSizes.map(async (size) => {
            const thumbnail = await sharp(req.file.buffer)
                .resize(size, size, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();

            return minioClient.putObject(
                THUMBNAILS_BUCKET,
                `${uniquePath}_${size}.jpg`,
                thumbnail,
                thumbnail.length,
                {
                    'Content-Type': 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000'
                }
            );
        });

        await Promise.all(thumbnailPromises);

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                path: uniquePath,
                hash: hash,
                originalName: originalFilename,
                size: req.file.size,
                optimizedSize: optimizedBuffer.length,
                uploadedAt: uploadDate,
                uploadedBy: req.user.id,
                thumbnails: thumbnailSizes
            },
            urls: generateImageUrls(uniquePath)
        });

    } catch (error) {
        console.error('Upload process failed:', error.message);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
}

export async function getImage(req, res) {
    try {
        const imagePath = req.params[0];
        const { size } = req.query;

        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        let bucket = IMAGES_BUCKET;
        let key = `${imagePath}.jpg`;

        if (size && ['150', '300', '600'].includes(size)) {
            bucket = THUMBNAILS_BUCKET;
            key = `${imagePath}_${size}.jpg`;
        }

        try {
            const imageStream = await minioClient.getObject(bucket, key);

            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=31536000');

            imageStream.pipe(res);
        } catch {
            res.status(404).json({ error: 'Image not found' });
        }

    } catch (error) {
        console.error('Image retrieval failed:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve image',
            details: error.message
        });
    }
}

export async function resizeImage(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { width, height } = req.params;
        const imagePath = req.params[0];

        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        try {
            await minioClient.statObject(IMAGES_BUCKET, `${imagePath}.jpg`);
        } catch {
            return res.status(404).json({ error: 'Image not found' });
        }

        const cacheKey = `${imagePath}_${width}x${height}.jpg`;

        try {
            const cachedImageStream = await minioClient.getObject(CACHE_BUCKET, cacheKey);

            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=31536000');
            res.set('X-Image-Source', 'cache');

            cachedImageStream.pipe(res);
            return;
        } catch {
            const originalImageStream = await minioClient.getObject(IMAGES_BUCKET, `${imagePath}.jpg`);

            const chunks = [];
            for await (const chunk of originalImageStream) {
                chunks.push(chunk);
            }
            const originalBuffer = Buffer.concat(chunks);

            const resizedImage = await sharp(originalBuffer)
                .resize(parseInt(width), parseInt(height), { fit: 'cover' })
                .jpeg({ quality: 85 })
                .toBuffer();

            await minioClient.putObject(
                CACHE_BUCKET,
                cacheKey,
                resizedImage,
                resizedImage.length,
                {
                    'Content-Type': 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000'
                }
            );

            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=31536000');
            res.set('X-Image-Source', 'generated');
            res.send(resizedImage);
        }

    } catch (error) {
        console.error('Image resize failed:', error.message);
        res.status(500).json({
            error: 'Failed to resize image',
            details: error.message
        });
    }
}

export async function deleteImage(req, res) {
    try {
        const imagePath = req.params[0];

        if (!imagePath) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const objectsToDelete = [
            { bucket: IMAGES_BUCKET, key: `${imagePath}.jpg` },
            { bucket: THUMBNAILS_BUCKET, key: `${imagePath}_150.jpg` },
            { bucket: THUMBNAILS_BUCKET, key: `${imagePath}_300.jpg` },
            { bucket: THUMBNAILS_BUCKET, key: `${imagePath}_600.jpg` }
        ];

        let deletedCount = 0;
        for (const obj of objectsToDelete) {
            try {
                await minioClient.removeObject(obj.bucket, obj.key);
                deletedCount++;
            } catch {
                // Object doesn't exist, continue deletion process
            }
        }

        try {
            const cacheObjects = [];
            const stream = minioClient.listObjects(CACHE_BUCKET, imagePath, true);

            for await (const obj of stream) {
                cacheObjects.push(obj.name);
            }

            if (cacheObjects.length > 0) {
                await minioClient.removeObjects(CACHE_BUCKET, cacheObjects);
                deletedCount += cacheObjects.length;
            }
        } catch {
            // Cache cleanup failed, but main deletion may have succeeded
        }

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            path: imagePath,
            deletedObjects: deletedCount
        });

    } catch (error) {
        console.error('Image deletion failed:', error.message);
        res.status(500).json({
            error: 'Failed to delete image',
            details: error.message
        });
    }
}

export async function getAllImages(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const images = [];
        const stream = minioClient.listObjects(IMAGES_BUCKET, '', true);

        for await (const obj of stream) {
            if (obj.name.endsWith('.jpg')) {
                const imagePath = obj.name.replace('.jpg', '');
                images.push({
                    path: imagePath,
                    size: obj.size,
                    lastModified: obj.lastModified,
                    urls: generateImageUrls(imagePath)
                });
            }
        }

        images.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        const paginatedImages = images.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            images: paginatedImages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(images.length / limit),
                totalImages: images.length,
                hasMore: skip + paginatedImages.length < images.length
            }
        });

    } catch (error) {
        console.error('Failed to retrieve images:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve images',
            details: error.message
        });
    }
}

export async function clearCache(req, res) {
    try {
        const objects = [];
        const stream = minioClient.listObjects(CACHE_BUCKET, '', true);

        for await (const obj of stream) {
            objects.push(obj.name);
        }

        if (objects.length > 0) {
            await minioClient.removeObjects(CACHE_BUCKET, objects);
        }

        res.status(200).json({
            success: true,
            message: 'Cache cleared successfully',
            removedObjects: objects.length
        });

    } catch (error) {
        console.error('Cache clearing failed:', error.message);
        res.status(500).json({
            error: 'Failed to clear cache',
            details: error.message
        });
    }
}

function generateImageUrls(imagePath) {
    const baseUrl = process.env.API_URI || 'http://localhost:3100';

    return {
        api: {
            original: `${baseUrl}/api/images/${imagePath}`,
            thumbnail_150: `${baseUrl}/api/images/${imagePath}?size=150`,
            thumbnail_300: `${baseUrl}/api/images/${imagePath}?size=300`,
            thumbnail_600: `${baseUrl}/api/images/${imagePath}?size=600`,
            resize: `${baseUrl}/api/images/resize/{width}/{height}/${imagePath}`
        },
        direct: {
            original: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${IMAGES_BUCKET}/${imagePath}.jpg`,
            thumbnail_150: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_150.jpg`,
            thumbnail_300: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_300.jpg`,
            thumbnail_600: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_600.jpg`
        }
    };
}