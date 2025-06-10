const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Pour hasher les mots de passe
const prisma = new PrismaClient();

module.exports = {
    // Fonction asynchrone pour créer un nouvel utilisateur
    createUser: async (req, res) => {
        // Extraction des données de la requête
        const { username, name, email, password, bio, ppPath, language } = req.body;

        // Vérification des champs obligatoires
        if (!username || !name || !email || !password) {
            return res.status(400).json({
                error: "Username, name, email and password are required"
            });
        }

        try {
            // Vérifier si l'utilisateur existe déjà (email ou username)
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

            // Hasher le mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Création d'un nouvel utilisateur dans la base de données
            const newUser = await prisma.user_.create({
                data: {
                    username,
                    name,
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
                    // Exclu passwordHash pour la sécurité
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
    },

    // Fonction asynchrone pour récupérer tous les utilisateurs
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (page - 1) * limit;

            // Construire le filtre de recherche
            const where = search ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            } : {};

            // Récupération de tous les utilisateurs avec pagination
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

            // Compter le total pour la pagination
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
    },

    // Fonction pour récupérer un utilisateur par ID
    getUserById: async (req, res) => {
        try {
            const userId = req.params.id;

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
                        take: 10 // Limiter aux 10 derniers posts
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
    },

    // Fonction pour récupérer un utilisateur par username
    getUserByUsername: async (req, res) => {
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
    },

    // Fonction pour modifier un utilisateur
    modifyUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, name, email, bio, ppPath, language, currentPassword, newPassword } = req.body;

            // Vérifier que l'utilisateur existe
            const existingUser = await prisma.user_.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            // Préparer les données à mettre à jour
            const updateData = {};

            // Vérifier l'unicité de l'email et username si ils sont modifiés
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

            // Autres champs
            if (name) updateData.name = name;
            if (bio !== undefined) updateData.bio = bio;
            if (ppPath !== undefined) updateData.ppPath = ppPath;
            if (language !== undefined) updateData.language = language;

            // Gestion du changement de mot de passe
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({
                        error: "Current password is required to set new password"
                    });
                }

                // Vérifier le mot de passe actuel
                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.passwordHash);
                if (!isCurrentPasswordValid) {
                    return res.status(401).json({
                        error: "Current password is incorrect"
                    });
                }

                // Hasher le nouveau mot de passe
                const saltRounds = 10;
                updateData.passwordHash = await bcrypt.hash(newPassword, saltRounds);
            }

            // Mettre à jour l'utilisateur
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
    },

    // Fonction pour supprimer un utilisateur
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Vérifier que l'utilisateur existe
            const existingUser = await prisma.user_.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            // Supprimer l'utilisateur (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
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
    },

    // Fonction pour bloquer/débloquer un utilisateur
    toggleBlockUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Vérifier que l'utilisateur existe
            const existingUser = await prisma.user_.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            // Inverser le statut de blocage
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
    },

    // Fonction pour suivre/ne plus suivre un utilisateur
    toggleFollowUser: async (req, res) => {
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

            // Vérifier si la relation existe déjà
            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followedId: {
                        followerId: followerId,
                        followedId: followedId
                    }
                }
            });

            if (existingFollow) {
                // Supprimer le suivi
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
                // Créer le suivi
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
    },

    // Fonction pour récupérer les followers d'un utilisateur
    getUserFollowers: async (req, res) => {
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
    },

    // Fonction pour récupérer les utilisateurs suivis
    getUserFollowing: async (req, res) => {
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
};

// Fermer la connexion Prisma à l'arrêt de l'application
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});