const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    createPost: async (req, res) => {
        const { message, author, originalPostId, parentCommentId } = req.body;

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

            if (originalPostId) {
                const originalPost = await prisma.post.findUnique({
                    where: { id: originalPostId }
                });

                if (!originalPost) {
                    await prisma.post.delete({ where: { id: newPost.id } });
                    return res.status(404).json({
                        error: "Original post not found"
                    });
                }

                if (parentCommentId) {
                    const parentComment = await prisma.commentPost.findUnique({
                        where: { id: parentCommentId }
                    });

                    if (!parentComment || parentComment.postId !== originalPostId) {
                        await prisma.post.delete({ where: { id: newPost.id } });
                        return res.status(400).json({
                            error: "Invalid parent comment"
                        });
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
                    type: "comment"
                });
            }

            res.status(201).json({
                message: "Post created successfully",
                post: newPost,
                type: "post"
            });
        } catch (err) {
            console.error("Error creating post:", err);
            res.status(500).json({
                error: "Internal server error",
                details: err.message
            });
        }
    },

    getAllPosts: async (req, res) => {
        try {
            const posts = await prisma.post.findMany({
                where: {
                    thisIsComment: null
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
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.status(200).json(posts);
        } catch (err) {
            console.error("Error fetching posts:", err);
            res.status(500).json({
                error: "Internal server error",
                details: err.message
            });
        }
    },

    getPostById: async (req, res) => {
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
    },

    getPostComments: async (req, res) => {
        try {
            const { postId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

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
                            }
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
                                    }
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
                                            }
                                        }
                                    }
                                },
                                orderBy: {
                                    createdAt: 'asc'
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

            const totalComments = await prisma.commentPost.count({
                where: {
                    postId: postId,
                    parentId: null
                }
            });

            res.status(200).json({
                comments,
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
    },

    deletePost: async (req, res) => {
        try {
            const postId = req.params.id;
            const { userId } = req.body;

            const post = await prisma.post.findUnique({
                where: { id: postId }
            });

            if (!post) {
                return res.status(404).json({
                    error: "Post not found"
                });
            }

            if (post.author !== userId) {
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
    },

    modifyPost: async (req, res) => {
        try {
            const postId = req.params.id;
            const { userId, message } = req.body;

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

            if (post.author !== userId) {
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
    },

    likePost: async (req, res) => {
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

            const existingLike = await prisma.likePost.findUnique({
                where: {
                    idPost_author: {
                        idPost: postId,
                        author: userId
                    }
                }
            });

            if (existingLike) {
                await prisma.likePost.delete({
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
                    message: "Post unliked",
                    liked: false,
                    like_Number: likeCount
                });
            } else {
                await prisma.likePost.create({
                    data: {
                        idPost: postId,
                        author: userId
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
};