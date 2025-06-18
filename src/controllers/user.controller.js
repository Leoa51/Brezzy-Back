import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
const prisma = new PrismaClient();

export async function createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, name, firstName, email, password, bio, ppPath, language } = req.body;

    if (!username || !name || !email || !password || !firstName) {
        return res.status(400).json({
            error: "Username, name, email and password are required"
        });
    }
    try {
        const existingUser = await prisma.user_.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        if (existingUser) {
            return res.status(409).json({
                error: "User with this email or username already exists"
            });
        }

        // Hash password
        // const saltRounds = 10;
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user_.create({
            data: {
                username,
                name,
                firstName,
                email,
                passwordHash: password,
                bio: bio || null,
                ppPath: ppPath || null,
                language: language || null,
                isBlocked: false
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                bio: true,
                ppPath: true,
                language: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getAllUsers(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const users = await prisma.user_.findMany({
            where,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                bio: true,
                ppPath: true,
                language: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const totalUsers = await prisma.user_.count({ where });

        res.status(200).json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasMore: skip + users.length < totalUsers
            }
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getUserById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;

        const user = await prisma.user_.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                firstName: true,
                email: true,
                bio: true,
                ppPath: true,
                language: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true,
                posts: {
                    select: {
                        id: true,
                        message: true,
                        createdAt: true,
                        _count: {
                            select: {
                                likes: true,
                                commentsOnThis: true,
                                tags: true,
                                reports: true,
                                linkImages: true,
                                linkVideos: true,
                                publications: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                        likes: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}





export async function getUserInfoById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;

        const user = await prisma.user_.findUnique({
            where: { id: userId },
            select: {
                username: true,
                bio: true,
                ppPath: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getUserByUsername(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { username } = req.params;

        const user = await prisma.user_.findUnique({
            where: { username: username },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                bio: true,
                ppPath: true,
                language: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true,
                posts: {
                    select: {
                        id: true,
                        message: true,
                        createdAt: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function modifyUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;
        const { username, name, email, bio, ppPath, language, currentPassword, newPassword } = req.body;

        const existingUser = await prisma.user_.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const updateData = {};

        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user_.findUnique({
                where: { email: email }
            });
            if (emailExists) {
                return res.status(409).json({
                    error: "Email already exists"
                });
            }
            updateData.email = email;
        }

        if (username && username !== existingUser.username) {
            const usernameExists = await prisma.user_.findUnique({
                where: { username: username }
            });
            if (usernameExists) {
                return res.status(409).json({
                    error: "Username already exists"
                });
            }
            updateData.username = username;
        }

        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (ppPath !== undefined) updateData.ppPath = ppPath;
        if (language !== undefined) updateData.language = language;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    error: "Current password is required to set new password"
                });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.passwordHash);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    error: "Current password is incorrect"
                });
            }

            const saltRounds = 10;
            updateData.passwordHash = await bcrypt.hash(newPassword, saltRounds);
        }

        const updatedUser = await prisma.user_.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                bio: true,
                ppPath: true,
                language: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function deleteUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;

        const existingUser = await prisma.user_.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        await prisma.user_.delete({
            where: { id: userId }
        });

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function toggleBlockUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;

        const existingUser = await prisma.user_.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const updatedUser = await prisma.user_.update({
            where: { id: userId },
            data: {
                isBlocked: !existingUser.isBlocked
            },
            select: {
                id: true,
                username: true,
                name: true,
                isBlocked: true
            }
        });

        res.status(200).json({
            message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: updatedUser
        });
    } catch (err) {
        console.error("Error toggling user block status:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function toggleFollowUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { followerId, followedId } = req.body;

        if (!followerId || !followedId) {
            return res.status(400).json({
                error: "FollowerId and followedId are required"
            });
        }

        if (followerId === followedId) {
            return res.status(400).json({
                error: "Cannot follow yourself"
            });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followedId: {
                    followerId: followerId,
                    followedId: followedId
                }
            }
        });

        if (existingFollow) {
            await prisma.follow.delete({
                where: {
                    followerId_followedId: {
                        followerId: followerId,
                        followedId: followedId
                    }
                }
            });

            res.status(200).json({
                message: "Unfollowed successfully",
                following: false
            });
        } else {
            await prisma.follow.create({
                data: {
                    followerId: followerId,
                    followedId: followedId
                }
            });

            res.status(200).json({
                message: "Followed successfully",
                following: true
            });
        }
    } catch (err) {
        console.error("Error toggling follow:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getUserFollowers(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const followers = await prisma.follow.findMany({
            where: { followedId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true,
                        bio: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const totalFollowers = await prisma.follow.count({
            where: { followedId: userId }
        });

        res.status(200).json({
            followers: followers.map(f => f.follower),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFollowers / limit),
                totalFollowers,
                hasMore: skip + followers.length < totalFollowers
            }
        });
    } catch (err) {
        console.error("Error fetching followers:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function getUserFollowing(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                followed: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        ppPath: true,
                        bio: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const totalFollowing = await prisma.follow.count({
            where: { followerId: userId }
        });

        res.status(200).json({
            following: following.map(f => f.followed),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFollowing / limit),
                totalFollowing,
                hasMore: skip + following.length < totalFollowing
            }
        });
    } catch (err) {
        console.error("Error fetching following:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}


// export async function getUserMessages(req, res) {
//     try {
//         const userId = req.params.id;
//         const { page = 1, limit = 20 } = req.query;
//         const skip = (page - 1) * limit;
//
//         const messages = await prisma.message.findMany({
//             where: { receiverId: userId },
//             include: {
//                 sender: {
//                     select: {
//                         id: true,
//                         username: true,
//                         ppPath: true
//                     }
//                 }
//             },
//             orderBy: {
//                 createdAt: 'desc'
//             },
//             skip: parseInt(skip),
//             take: parseInt(limit)
//         });
//
//         const totalMessages = await prisma.message.count({
//             where: { receiverId: userId }
//         });
//
//         res.status(200).json({
//             messages: messages.map(m => m.sender),
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(totalMessages / limit),
//                 totalMessages,
//                 hasMore: skip + messages.length < totalMessages
//             }
//         });
//     } catch (err) {
//         console.error("Error fetching messages:", err);
//         res.status(500).json({
//             error: "Internal server error",
//             details: err.message
//         });
//     }
// }

export async function getUserMessages(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            where: { author: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        ppPath: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        commentsOnThis: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const totalPosts = await prisma.post.count({
            where: { author: userId }
        });

        res.status(200).json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: skip + posts.length < totalPosts
            }
        });
    } catch (err) {
        console.error("Error fetching user posts:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}




export async function blockUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userIdToBlock = req.body.id;

        const userExists = await prisma.user_.findUnique({
            where: { id: userIdToBlock },
            select: { id: true, username: true, isBlocked: true }
        });

        if (!userExists) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if (userExists.isBlocked) {
            return res.status(400).json({
                error: "User is already blocked"
            });
        }

        const blockedUser = await prisma.user_.update({
            where: { id: userIdToBlock },
            data: { isBlocked: true },
            select: {
                id: true,
                username: true,
                name: true,
                isBlocked: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            message: "User blocked successfully",
            user: blockedUser
        });
    } catch (err) {
        console.error("Error blocking user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}

export async function unblockUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const userIdToUnblock = req.body.id;

        const userExists = await prisma.user_.findUnique({
            where: { id: userIdToUnblock },
            select: { id: true, username: true, isBlocked: true }
        });

        if (!userExists) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if (!userExists.isBlocked) {
            return res.status(400).json({
                error: "User is not blocked"
            });
        }

        const unblockedUser = await prisma.user_.update({
            where: { id: userIdToUnblock },
            data: { isBlocked: false },
            select: {
                id: true,
                username: true,
                name: true,
                isBlocked: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            message: "User unblocked successfully",
            user: unblockedUser
        });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}
export async function getMe(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const user = await prisma.user_.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                firstName: true,
                email: true,
                username: true,
                ppPath: true,
                language: true,
                bio: true,
                validated: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error("Error retrieving user info:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}



export async function updateProfilePicture(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({
            error: "No profile picture provided"
        });
    }

    try {
        const currentUser = await prisma.user_.findUnique({
            where: { id: userId },
            select: { ppPath: true }
        });

        if (!currentUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('image', blob, `profile_${userId}_${req.file.originalname}`);

        const uploadResponse = await fetch('http://localhost:3100/api/media/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': 'UserService/1.0'
            }
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Profile picture upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success && uploadResult.data) {
            const updatedUser = await prisma.user_.update({
                where: { id: userId },
                data: {
                    ppPath: uploadResult.data.path
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    ppPath: true,
                    email: true,
                    bio: true
                }
            });

            if (currentUser.ppPath) {
                try {
                    await fetch(`http://localhost:3100/api/media/delete/${encodeURIComponent(currentUser.ppPath)}`, {
                        method: 'DELETE',
                        headers: {
                            'User-Agent': 'UserService/1.0'
                        }
                    });
                } catch (deleteError) {
                    console.error("Failed to delete old profile picture:", deleteError.message);
                }
            }

            res.status(200).json({
                message: "Profile picture updated successfully",
                user: updatedUser,
                profilePicture: uploadResult.data.path
            });

        } else {
            console.error("Invalid upload response structure:", uploadResult);
            res.status(500).json({
                error: "Profile picture upload failed"
            });
        }

    } catch (err) {
        console.error("Error updating profile picture:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
}


process.on('beforeExit', async () => {
    await prisma.$disconnect();
});