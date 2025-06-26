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
const API_URI = process.env.API_URI || 'http://localhost:3100';

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
        const fileExtension = originalFilename.split('.').pop().toLowerCase();
        const uniquePath = generateUniqueImagePath(originalFilename);
        const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

        let outputFormat = 'jpeg';
        let contentType = 'image/jpeg';
        let extension = 'jpg';

        if (['png', 'webp', 'gif'].includes(fileExtension)) {
            outputFormat = fileExtension;
            contentType = `image/${fileExtension}`;
            extension = fileExtension;
        }

        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
            [outputFormat]({ quality: 85 })
            .toBuffer();

        const uploadDate = new Date().toISOString();
        const fullObjectKey = `${uniquePath}.${extension}`;

        // Store only the relative path in the database
        const relativeUrlPath = `/api/media/${uniquePath}.${extension}`;

        await minioClient.putObject(
            IMAGES_BUCKET,
            fullObjectKey,
            optimizedBuffer,
            optimizedBuffer.length,
            {
                'Content-Type': contentType,
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
                path: relativeUrlPath,
                cdnPath: relativeUrlPath,
                extension: extension,
                hash: hash,
                originalName: originalFilename,
                size: req.file.size,
                optimizedSize: optimizedBuffer.length,
                uploadedAt: uploadDate,
                uploadedBy: req.user.id,
                thumbnails: thumbnailSizes.map(size => `/api/media/${uniquePath}.${extension}?size=${size}`)
            },
            urls: generateImageUrls(uniquePath, extension)
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
        const { year, month, day, filename } = req.params;
        const { size } = req.query;

        if (!year || !month || !day || !filename) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const filenameParts = filename.split('.');
        const fileExtension = filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : 'jpg';
        const filenameBase = filenameParts.join('.');

        const pathWithoutExt = `${year}/${month}/${day}/${filenameBase}`;
        const fullPath = `${pathWithoutExt}.${fileExtension}`;

        const mimeTypeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        };
        const mimeType = mimeTypeMap[fileExtension] || 'application/octet-stream';

        let bucket = IMAGES_BUCKET;
        let key = fullPath;

        if (size && ['150', '300', '600'].includes(size)) {
            bucket = THUMBNAILS_BUCKET;
            key = `${pathWithoutExt}_${size}.jpg`;
        }

        try {
            const imageStream = await minioClient.getObject(bucket, key);

            res.set('Content-Type', mimeType);
            res.set('Cache-Control', 'public, max-age=31536000');

            imageStream.pipe(res);

            imageStream.on('error', (err) => {
                console.error(`Stream error for ${bucket}/${key}:`, err.message);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to stream image' });
                }
            });
        } catch (err) {
            console.error(`Image not found: ${bucket}/${key}`);
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
        const { width, height, year, month, day, filename } = req.params;

        if (!year || !month || !day || !filename) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const filenameParts = filename.split('.');
        const fileExtension = filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : 'jpg';
        const filenameBase = filenameParts.join('.');

        const pathWithoutExt = `${year}/${month}/${day}/${filenameBase}`;
        const fullPath = `${pathWithoutExt}.${fileExtension}`;

        try {
            await minioClient.statObject(IMAGES_BUCKET, fullPath);
        } catch {
            return res.status(404).json({ error: 'Image not found' });
        }

        const cacheKey = `${pathWithoutExt}_${width}x${height}.jpg`;

        try {
            const cachedImageStream = await minioClient.getObject(CACHE_BUCKET, cacheKey);

            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=31536000');
            res.set('X-Image-Source', 'cache');

            cachedImageStream.pipe(res);
            return;
        } catch {
            const originalImageStream = await minioClient.getObject(IMAGES_BUCKET, fullPath);

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
        const { year, month, day, filename } = req.params;

        if (!year || !month || !day || !filename) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const filenameParts = filename.split('.');
        const fileExtension = filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : 'jpg';
        const filenameBase = filenameParts.join('.');

        const pathWithoutExt = `${year}/${month}/${day}/${filenameBase}`;
        const fullPath = `${pathWithoutExt}.${fileExtension}`;

        const objectsToDelete = [
            { bucket: IMAGES_BUCKET, key: fullPath },
            { bucket: THUMBNAILS_BUCKET, key: `${pathWithoutExt}_150.jpg` },
            { bucket: THUMBNAILS_BUCKET, key: `${pathWithoutExt}_300.jpg` },
            { bucket: THUMBNAILS_BUCKET, key: `${pathWithoutExt}_600.jpg` }
        ];

        let deletedCount = 0;
        for (const obj of objectsToDelete) {
            try {
                await minioClient.removeObject(obj.bucket, obj.key);
                deletedCount++;
            } catch {
                // Object may not exist
            }
        }

        try {
            const cacheObjects = [];
            const stream = minioClient.listObjects(CACHE_BUCKET, pathWithoutExt, true);

            for await (const obj of stream) {
                cacheObjects.push(obj.name);
            }

            if (cacheObjects.length > 0) {
                await minioClient.removeObjects(CACHE_BUCKET, cacheObjects);
                deletedCount += cacheObjects.length;
            }
        } catch {
            // Cache cleanup failed but primary deletion may have succeeded
        }

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            path: pathWithoutExt,
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
            if (obj.name.endsWith('.jpg') || obj.name.endsWith('.png') ||
                obj.name.endsWith('.gif') || obj.name.endsWith('.webp')) {
                const extension = obj.name.split('.').pop().toLowerCase();
                const imagePath = obj.name.substring(0, obj.name.length - extension.length - 1);
                const relativeUrlPath = `/api/media/${imagePath}.${extension}`;

                images.push({
                    path: imagePath,
                    fullPath: relativeUrlPath,
                    extension: extension,
                    size: obj.size,
                    lastModified: obj.lastModified,
                    urls: generateImageUrls(imagePath, extension)
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

function generateImageUrls(imagePath, extension = 'jpg') {
    const baseUrl = process.env.API_URI || 'http://localhost:3100';

    return {
        api: {
            original: `/api/media/${imagePath}.${extension}`,
            thumbnail_150: `/api/media/${imagePath}.${extension}?size=150`,
            thumbnail_300: `/api/media/${imagePath}.${extension}?size=300`,
            thumbnail_600: `/api/media/${imagePath}.${extension}?size=600`,
            resize: `/api/media/resize/{width}/{height}/${imagePath}.${extension}`
        },
        direct: {
            original: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${IMAGES_BUCKET}/${imagePath}.${extension}`,
            thumbnail_150: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_150.jpg`,
            thumbnail_300: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_300.jpg`,
            thumbnail_600: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${THUMBNAILS_BUCKET}/${imagePath}_600.jpg`
        }
    };
}