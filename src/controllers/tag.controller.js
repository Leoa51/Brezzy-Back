import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createTag(req, res) {
    const { idTag, name } = req.body;

    if (!idTag || !name) {
        return res.status(400).json({
            error: "idTag and name are required"
        });
    }

    try {
        const existingTag = await prisma.tag.findFirst({
            where: {
                OR: [
                    { idTag: idTag },
                    { name: name }
                ]
            }
        });

        if (existingTag) {
            return res.status(409).json({
                error: "Tag with this idTag or name already exists"
            });
        }

        const newTag = await prisma.tag.create({
            data: {
                idTag,
                name
            },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Tag created successfully",
            tag: newTag
        });
    } catch (err) {
        console.error("Error creating tag:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getAllTags(req, res) {
    try {
        const { page = 1, limit = 20, search = '', sortBy = 'popularity' } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { idTag: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        let orderBy = {};
        switch (sortBy) {
            case 'popularity':
                orderBy = { posts: { _count: 'desc' } };
                break;
            case 'name':
                orderBy = { name: 'asc' };
                break;
            case 'recent':
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        const tags = await prisma.tag.findMany({
            where,
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy,
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const totalTags = await prisma.tag.count({ where });

        res.status(200).json({
            tags,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalTags / limit),
                totalTags,
                hasMore: skip + tags.length < totalTags
            }
        });
    } catch (err) {
        console.error("Error fetching tags:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getTagById(req, res) {
    try {
        const tagId = req.params.id;

        const tag = await prisma.tag.findUnique({
            where: { id: tagId },
            include: {
                posts: {
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
                                        likes: true,
                                        comments: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        post: {
                            createdAt: 'desc'
                        }
                    }
                },
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        if (!tag) {
            return res.status(404).json({
                error: "Tag not found"
            });
        }

        res.status(200).json(tag);
    } catch (err) {
        console.error("Error fetching tag:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getTagByIdTag(req, res) {
    try {
        const { idTag } = req.params;

        const tag = await prisma.tag.findUnique({
            where: { idTag: idTag },
            include: {
                posts: {
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
                                        likes: true,
                                        comments: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        post: {
                            createdAt: 'desc'
                        }
                    }
                },
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        if (!tag) {
            return res.status(404).json({
                error: "Tag not found"
            });
        }

        res.status(200).json(tag);
    } catch (err) {
        console.error("Error fetching tag:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function modifyTag(req, res) {
    try {
        const tagId = req.params.id;
        const { idTag, name } = req.body;

        const existingTag = await prisma.tag.findUnique({
            where: { id: tagId }
        });

        if (!existingTag) {
            return res.status(404).json({
                error: "Tag not found"
            });
        }

        const updateData = {};

        if (idTag && idTag !== existingTag.idTag) {
            const idTagExists = await prisma.tag.findUnique({
                where: { idTag: idTag }
            });
            if (idTagExists) {
                return res.status(409).json({
                    error: "Tag with this idTag already exists"
                });
            }
            updateData.idTag = idTag;
        }

        if (name && name !== existingTag.name) {
            const nameExists = await prisma.tag.findFirst({
                where: {
                    name: name,
                    NOT: { id: tagId }
                }
            });
            if (nameExists) {
                return res.status(409).json({
                    error: "Tag with this name already exists"
                });
            }
            updateData.name = name;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No fields to update"
            });
        }

        const updatedTag = await prisma.tag.update({
            where: { id: tagId },
            data: updateData,
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Tag updated successfully",
            tag: updatedTag
        });
    } catch (err) {
        console.error("Error updating tag:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function deleteTag(req, res) {
    try {
        const tagId = req.params.id;

        const existingTag = await prisma.tag.findUnique({
            where: { id: tagId },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        if (!existingTag) {
            return res.status(404).json({
                error: "Tag not found"
            });
        }

        if (existingTag._count.posts > 0) {
            const { force } = req.query;
            if (!force) {
                return res.status(400).json({
                    error: `Tag is used in ${existingTag._count.posts} posts. Add ?force=true to delete anyway.`,
                    postsCount: existingTag._count.posts
                });
            }
        }

        await prisma.tag.delete({
            where: { id: tagId }
        });

        res.status(200).json({
            message: "Tag deleted successfully",
            deletedTag: {
                id: existingTag.id,
                idTag: existingTag.idTag,
                name: existingTag.name,
                postsCount: existingTag._count.posts
            }
        });
    } catch (err) {
        console.error("Error deleting tag:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function addTagToPost(req, res) {
    try {
        const { tagId, postId, authorId } = req.body;

        if (!tagId || !postId || !authorId) {
            return res.status(400).json({
                error: "tagId, postId and authorId are required"
            });
        }

        const tag = await prisma.tag.findUnique({
            where: { idTag: tagId }
        });

        if (!tag) {
            return res.status(404).json({
                error: "Tag not found"
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

        const user = await prisma.user_.findUnique({
            where: { id: authorId }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const existingAssociation = await prisma.asso11.findUnique({
            where: {
                idTag_idPost: {
                    idTag: tagId,
                    idPost: postId
                }
            }
        });

        if (existingAssociation) {
            return res.status(409).json({
                error: "Tag is already associated with this post"
            });
        }

        const newAssociation = await prisma.asso11.create({
            data: {
                idTag: tagId,
                idPost: postId,
                author: authorId
            },
            include: {
                tag: true,
                post: {
                    select: {
                        id: true,
                        message: true,
                        author: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Tag added to post successfully",
            association: newAssociation
        });
    } catch (err) {
        console.error("Error adding tag to post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function removeTagFromPost(req, res) {
    try {
        const { tagId, postId } = req.params;

        const existingAssociation = await prisma.asso11.findUnique({
            where: {
                idTag_idPost: {
                    idTag: tagId,
                    idPost: postId
                }
            }
        });

        if (!existingAssociation) {
            return res.status(404).json({
                error: "Tag association not found"
            });
        }

        await prisma.asso11.delete({
            where: {
                idTag_idPost: {
                    idTag: tagId,
                    idPost: postId
                }
            }
        });

        res.status(200).json({
            message: "Tag removed from post successfully"
        });
    } catch (err) {
        console.error("Error removing tag from post:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getTrendingTags(req, res) {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (timeframe) {
            case 'day':
                dateFilter = {
                    createdAt: {
                        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    }
                };
                break;
            case 'week':
                dateFilter = {
                    createdAt: {
                        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    }
                };
                break;
            case 'month':
                dateFilter = {
                    createdAt: {
                        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    }
                };
                break;
            default:
                dateFilter = {};
        }

        const trendingTags = await prisma.tag.findMany({
            where: {
                posts: {
                    some: {
                        post: dateFilter
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                posts: {
                    _count: 'desc'
                }
            },
            take: parseInt(limit)
        });

        res.status(200).json({
            trendingTags,
            timeframe,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error("Error fetching trending tags:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function searchTags(req, res) {
    try {
        const { q, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                error: "Query parameter 'q' is required"
            });
        }

        const tags = await prisma.tag.findMany({
            where: {
                OR: [
                    { idTag: { contains: q, mode: 'insensitive' } },
                    { name: { contains: q, mode: 'insensitive' } }
                ]
            },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                posts: {
                    _count: 'desc'
                }
            },
            take: parseInt(limit)
        });

        res.status(200).json({
            tags,
            query: q,
            count: tags.length
        });
    } catch (err) {
        console.error("Error searching tags:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getTagStats(req, res) {
    try {
        const totalTags = await prisma.tag.count();
        const totalAssociations = await prisma.asso11.count();

        const mostUsedTag = await prisma.tag.findFirst({
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                posts: {
                    _count: 'desc'
                }
            }
        });

        const recentTags = await prisma.tag.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            }
        });

        res.status(200).json({
            totalTags,
            totalAssociations,
            mostUsedTag,
            recentTags,
            averageTagsPerPost: totalAssociations / await prisma.post.count(),
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error("Error fetching tag stats:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}


export async function getTaggedPosts(req, res) {
    try {
        const { idTag } = req.params;

        if (!idTag) {
            return res.status(400).json({
                error: "Query parameter 'idTag' is required"
            });
        }

        const taggedPosts = await prisma.post.findMany({
            where: {
                tags: {
                    some: {
                        idTag: idTag
                    }
                }
            }
        });

        res.status(200).json({
            taggedPosts
        });
    } catch (err) {
        console.error("Error fetching tagged posts:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});