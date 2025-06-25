import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
const prisma = new PrismaClient();


export async function createPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message, originalPostId, parentCommentId, tags, image } = req.body;
    const author = req.user.id;
    if (!message || !author) {
        return res.status(400).json({
            error: "Message and author are required"
        });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                message,
                author
            },
            include: {
                user: { select: { id: true, username: true, name: true, ppPath: true } }
            }
        });



        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                const cleanName = tagName.replace(/^#/, '').trim().toLowerCase();
                if (!cleanName) continue;
                let tag = await prisma.tag.findFirst({ where: { name: cleanName } });
                if (!tag) {
                    tag = await prisma.tag.create({ data: { name: cleanName, idTag: cleanName } });
                }
                await prisma.asso11.upsert({
                    where: { idTag_idPost: { idTag: tag.idTag, idPost: newPost.id } },
                    update: {},
                    create: {
                        idTag: tag.idTag,
                        idPost: newPost.id,
                        author: req.user.id,
                    }
                });
            }
        }
        let uploadedImage = null;

        if (req.file) {
            try {
                const formData = new FormData();
                const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
                formData.append('image', blob, req.file.originalname);

                const uploadResponse = await fetch(process.env.API_URI + '/api/media/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'User-Agent': 'PostService/1.0',
                        Authorization: `${req.headers.authorization}`
                    }
                });
                // console.log({
                //     method: 'POST',
                //     body: formData,
                //     headers: {
                //         'User-Agent': 'PostService/1.0',
                //         Authorization: `Bearer ${req.headers.authorization}`
                //     }
                // });
                // console.log(uploadResponse);

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
                }

                const uploadResult = await uploadResponse.json();

                if (uploadResult.success && uploadResult.data) {
                    const createdImage = await prisma.image.create({
                        data: {
                            cdnPath: uploadResult.data.path,
                            author: req.user.id
                        }
                    });

                    const linkImg = await prisma.linkImg.create({
                        data: {
                            imageId: createdImage.id,
                            postAuthor: newPost.id,
                            linkAuthor: req.user.id
                        }
                    });

                    uploadedImage = uploadResult.data.path;
                } else {
                    console.error("Invalid upload response structure:", uploadResult);
                }

            } catch (uploadError) {
                console.error("Image upload error:", uploadError.message);
            }
        }

        if (originalPostId) {
            const originalPost = await prisma.post.findUnique({ where: { id: originalPostId } });

            if (!originalPost) {
                if (uploadedImage) {
                    await prisma.image.deleteMany({ where: { cdnPath: uploadedImage } });
                }
                await prisma.post.delete({ where: { id: newPost.id } });
                return res.status(404).json({ error: "Original post not found" });
            }

            if (parentCommentId) {
                const parentComment = await prisma.commentPost.findUnique({ where: { id: parentCommentId } });

                if (!parentComment || parentComment.postId !== originalPostId) {
                    if (uploadedImage) {
                        await prisma.image.deleteMany({ where: { cdnPath: uploadedImage } });
                    }
                    await prisma.post.delete({ where: { id: newPost.id } });
                    return res.status(400).json({ error: "Invalid parent comment" });
                }
            }

            await prisma.commentPost.create({
                data: {
                    commentId: newPost.id,
                    postId: originalPostId,
                    parentId: parentCommentId || null
                }
            });

            return res.status(201).json({
                message: parentCommentId ? "Reply created successfully" : "Comment created successfully",
                post: newPost,
                image: uploadedImage,
                type: "comment"
            });
        }

        res.status(201).json({
            message: "Post created successfully",
            post: newPost,
            image: uploadedImage,
            type: "post"
        });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}
export async function getAllPostFromFollowers(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const followedUsers = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followedId: true }
        });

        const followedIds = followedUsers.map(f => f.followedId);

        const posts = await prisma.post.findMany({
            where: {
                thisIsComment: null,
                author: {
                    in: followedIds
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true
                    }
                },
                _count: {
                    select: {
                        commentsOnThis: true,
                        likes: true
                    }
                },
                likes: {
                    where: {
                        author: userId
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: parseInt(limit)
        });

        const transformedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes && post.likes.length > 0,
            likes: undefined
        }));

        const totalPosts = await prisma.post.count({
            where: {
                thisIsComment: null,
                author: {
                    in: followedIds
                }
            }
        });

        const totalPages = Math.ceil(totalPosts / parseInt(limit));
        const currentPage = parseInt(page);

        res.status(200).json({
            posts: transformedPosts,
            pagination: {
                currentPage,
                totalPages,
                totalPosts,
                limit: parseInt(limit),
                hasMore: currentPage < totalPages,
                hasPrevious: currentPage > 1
            }
        });
    } catch (err) {
        console.error("Error fetching posts from followers:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getAllPosts(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { page = 1, limit = 20, keyword } = req.query;
        const skip = (page - 1) * limit;

        const currentUserId = req.user?.id;

        const where = {
            thisIsComment: null,
            user: {isBlocked: false},
        };

        if (keyword) {
            where.OR = [
                { message: { contains: keyword, mode: 'insensitive' } },
                { user: { username: { contains: keyword, mode: 'insensitive' } } },
                { user: { name: { contains: keyword, mode: 'insensitive' }, isBlocked: false } },
                { tags: { some: { tag: { name: { contains: keyword, mode: 'insensitive' } } } } }
            ];
        }

        const posts = await prisma.post.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true
                    }
                },
                _count: {
                    select: {
                        commentsOnThis: true,
                        likes: true
                    }
                },

                likes: currentUserId ? {
                    where: {
                        author: currentUserId
                    }
                } : false,
                linkImages: {
                    include: {
                        image: true
                    }
                },
                linkVideos: {
                    include: {
                        video: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const transformedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes && post.likes.length > 0,
            likes: undefined
        }));

        const totalPosts = await prisma.post.count({ where });
        const totalPages = Math.ceil(totalPosts / parseInt(limit));
        const currentPage = parseInt(page);

        res.status(200).json({
            posts: transformedPosts,
            pagination: {
                currentPage,
                totalPages,
                totalPosts,
                limit: parseInt(limit),
                hasMore: currentPage < totalPages,
                hasPrevious: currentPage > 1
            }
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}

export async function getPostById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const postId = req.params.id;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true,
                        bio: true
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        commentsOnThis: true,
                        likes: true,
                        reports: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getPostComments(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const currentUserId = req.user?.id;

        const comments = await prisma.commentPost.findMany({
            where: {
                postId: postId,
                parentId: null
            },
            include: {
                commentPost: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                ppPath: true
                            }
                        },
                        _count: {
                            select: {
                                commentsOnThis: true,
                                likes: true
                            }
                        },
                        likes: currentUserId ? {
                            where: {
                                author: currentUserId
                            }
                        } : false
                    }
                },
                replies: {
                    include: {
                        commentPost: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        name: true,
                                        ppPath: true
                                    }
                                },
                                _count: {
                                    select: {
                                        commentsOnThis: true,
                                        likes: true
                                    }
                                },
                                likes: currentUserId ? {
                                    where: {
                                        author: currentUserId
                                    }
                                } : false
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const transformedComments = comments.map(comment => ({
            ...comment,
            commentPost: {
                ...comment.commentPost,
                isLiked: comment.commentPost.likes && comment.commentPost.likes.length > 0,
                likes: undefined // Nettoyer pour éviter d'envoyer toutes les données
            }
        }));

        const totalComments = await prisma.commentPost.count({
            where: {
                postId: postId,
                parentId: null
            }
        });

        res.status(200).json({
            comments: transformedComments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalComments / limit),
                totalComments,
                hasMore: skip + comments.length < totalComments
            }
        });
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function deletePost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const postId = req.params.id;

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        if (post.author !== req.user.id) {
            return res.status(403).json({
                error: "You can only delete your own posts"
            });
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        res.status(200).json({
            message: "Post deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function modifyPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const postId = req.params.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        if (post.author !== req.user.id) {
            return res.status(403).json({
                error: "You can only edit your own posts"
            });
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { message },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function likePost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.body;

    try {
        const postExists = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!postExists) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const userExists = await prisma.user_.findUnique({
            where: { id: req.user.id }
        });

        if (!userExists) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const existingLike = await prisma.likePost.findUnique({
            where: {
                idPost_author: {
                    idPost: postId,
                    author: req.user.id
                }
            }
        });

        if (existingLike) {
            await prisma.likePost.delete({
                where: {
                    idPost_author: {
                        idPost: postId,
                        author: req.user.id
                    }
                }
            });

            const likeCount = await prisma.likePost.count({
                where: { idPost: postId }
            });

            res.status(200).json({
                message: "Post unliked",
                liked: false,
                like_Number: likeCount
            });
        } else {
            await prisma.likePost.create({
                data: {
                    idPost: postId,
                    author: req.user.id
                }
            });

            const likeCount = await prisma.likePost.count({
                where: { idPost: postId }
            });

            res.status(200).json({
                message: "Post liked",
                liked: true,
                like_Number: likeCount
            });
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getIsLiked(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const postExists = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!postExists) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const like = await prisma.likePost.findUnique({
            where: {
                idPost_author: {
                    idPost: postId,
                    author: userId
                }
            }
        });

        const likeCount = await prisma.likePost.count({
            where: { idPost: postId }
        });

        res.status(200).json({
            isLiked: !!like,
            likeCount: likeCount,
            postId: postId
        });

    } catch (err) {
        console.error("Error checking like status:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getReportedPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const reportedPosts = await prisma.post.findMany({
            where: {
                reports: {
                    some: {}
                }
            },
            select: {
                id: true,
                author: true,
                message: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                        isBlocked: true
                    }
                },
                _count: {
                    select: {
                        reports: true,
                        likes: true
                    }
                },

            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(
            reportedPosts,
        );

    } catch (error) {
        console.error('Erreur lors de la récupération des posts signalés:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur'
        });
    }
}

export async function getLikedPostsByUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const currentUserId = req.user?.id;

        const likedPosts = await prisma.likePost.findMany({
            where: {
                author: userId
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                ppPath: true
                            }
                        },
                        _count: {
                            select: {
                                commentsOnThis: true,
                                likes: true
                            }
                        },
                        likes: currentUserId ? {
                            where: {
                                author: currentUserId
                            }
                        } : false
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: parseInt(limit)
        });

        const posts = likedPosts.map(like => ({
            ...like.post,
            likedAt: like.createdAt,
            isLiked: like.post.likes && like.post.likes.length > 0,
            likes: undefined
        }));

        res.status(200).json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(likedPosts.length / parseInt(limit)),
                totalLikes: likedPosts.length
            }
        });

    } catch (err) {
        console.error("Error fetching liked posts:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function reportPost(req, res) {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            error: "postId and userId are required"
        });
    }

    try {
        const postExists = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!postExists) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        const userExists = await prisma.user_.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const existingReport = await prisma.reportPost.findUnique({
            where: {
                idPost_author: {
                    idPost: postId,
                    author: userId
                }
            }
        });

        if (!existingReport) {
            await prisma.reportPost.create({
                data: {
                    idPost: postId,
                    author: userId
                }
            });

            res.status(200).json({
                message: "Post reported successfully"
            });
        }
    } catch (err) {
        console.error("Error reporting post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}