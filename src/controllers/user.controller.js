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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user_.create({
            data: {
                username,
                name,
                firstName,
                email,
                passwordHash: hashedPassword,
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

    const userId = req.params.id;

    try {
        const user = await prisma.user_.findUnique({
            where: { id: userId },
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
                    },
                    take: 10
                },
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

export async function getUserByUsername(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username } = req.params;

    try {
        const user = await prisma.user_.findUnique({
            where: { username },
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
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

export async function getUserInfoById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const userId = req.params.id;

    try {
        const user = await prisma.user_.findUnique({
            where: { id: userId },
            select: {
                username: true,
                bio: true,
                ppPath: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user info:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

export async function modifyUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { username, name, email, bio, ppPath, language, currentPassword, newPassword } = req.body;

    try {
        const existingUser = await prisma.user_.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const updateData = {};

        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user_.findUnique({ where: { email } });
            if (emailExists) {
                return res.status(409).json({ error: "Email already exists" });
            }
            updateData.email = email;
        }

        if (username && username !== existingUser.username) {
            const usernameExists = await prisma.user_.findUnique({ where: { username } });
            if (usernameExists) {
                return res.status(409).json({ error: "Username already exists" });
            }
            updateData.username = username;
        }

        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (ppPath !== undefined) updateData.ppPath = ppPath;
        if (language !== undefined) updateData.language = language;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set new password" });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.passwordHash);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
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
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

export async function deleteUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const userId = req.params.id;

    try {
        const existingUser = await prisma.user_.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        await prisma.user_.delete({ where: { id: userId } });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}
