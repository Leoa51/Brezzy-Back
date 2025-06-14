import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

faker.locale = 'fr';

async function main() {
    console.log('🌱 Début du seeding...');

    console.log('🧹 Nettoyage de la base de données...');
    await prisma.linkVid.deleteMany();
    await prisma.linkImg.deleteMany();
    await prisma.asso11.deleteMany();
    await prisma.reportPost.deleteMany();
    await prisma.reportUser.deleteMany();
    await prisma.likePost.deleteMany();
    await prisma.commentPost.deleteMany();
    await prisma.publish.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.participants.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.video.deleteMany();
    await prisma.image.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user_.deleteMany();

    console.log('👥 Création de 100 utilisateurs...');
    const users = [];

    for (let i = 0; i < 100; i++) {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const username = faker.internet.userName(firstName, lastName).toLowerCase();
        const email = faker.internet.email(firstName, lastName).toLowerCase();
        const passwordHash = await bcrypt.hash('password123', 10);

        const user = await prisma.user_.create({
            data: {
                firstName,
                name: lastName,
                email,
                passwordHash,
                username: `${username}_${i}`,
                validated: faker.datatype.boolean(0.8),
                bio: faker.datatype.boolean(0.7) ? faker.lorem.sentences(2) : null,
                ppPath: faker.datatype.boolean(0.6) ? `/avatars/avatar_${i}.jpg` : null,
                language: faker.helpers.arrayElement(['fr', 'en', 'es', 'de']),
                isBlocked: faker.datatype.boolean(0.05),
            },
        });

        users.push(user);
    }

    console.log('🏷️ Création de 100 tags...');
    const tags = [];
    const tagNames = [
        'food', 'recipes', 'baking', 'desserts', 'healthy-eating', 'vegan', 'vegetarian',
        'fashion', 'style', 'outfit', 'beauty', 'makeup', 'skincare', 'hair',
        'home-decor', 'interior-design', 'diy', 'crafts', 'gardening', 'plants',
        'travel', 'adventure', 'photography', 'nature', 'landscape', 'sunset',
        'wedding', 'party', 'celebration', 'birthday', 'holiday', 'christmas',
        'fitness', 'workout', 'yoga', 'meditation', 'wellness', 'self-care',
        'art', 'drawing', 'painting', 'illustration', 'design', 'creativity',
        'animals', 'cats', 'dogs', 'pets', 'cute', 'baby-animals',
        'quotes', 'motivation', 'inspiration', 'lifestyle', 'mindfulness',
        'books', 'reading', 'education', 'learning', 'tips', 'life-hacks',
        'music', 'movies', 'entertainment', 'funny', 'memes', 'humor',
        'business', 'entrepreneur', 'marketing', 'productivity', 'success',
        'technology', 'gadgets', 'apps', 'social-media', 'digital',
        'handmade', 'vintage', 'antique', 'rustic', 'minimalist', 'modern',
        'kids', 'parenting', 'family', 'activities', 'games', 'toys'
    ];

    for (let i = 0; i < 100; i++) {
        const tagName = i < tagNames.length ? tagNames[i] : faker.lorem.word();

        const tag = await prisma.tag.create({
            data: {
                idTag: `tag_${i}_${tagName.toLowerCase()}`,
                name: tagName,
            },
        });

        tags.push(tag);
    }

    console.log('📝 Création de 10000 posts...');
    const posts = [];

    const messageTemplates = [
        "Découvrez cette recette de {topic} absolument délicieuse! 🍽️",
        "Nouvelle inspiration {topic} que j'adore partager avec vous",
        "DIY {topic} facile à réaliser chez soi, parfait pour le weekend",
        "Trouvé ce magnifique {topic} lors de mes dernières aventures",
        "Idées {topic} pour égayer votre quotidien ✨",
        "Tutoriel {topic} étape par étape pour les débutants",
        "Collection de mes {topic} préférés du moment",
        "Inspiration {topic} pour votre prochain projet créatif",
        "Guide complet {topic} à épingler absolument!",
        "Tendance {topic} qui fait sensation cette saison"
    ];

    for (let i = 0; i < 10000; i++) {
        const author = faker.helpers.arrayElement(users);
        const template = faker.helpers.arrayElement(messageTemplates);
        const randomTag = faker.helpers.arrayElement(tags);

        let message = template.replace('{topic}', randomTag.name);

        if (faker.datatype.boolean(0.3)) {
            message += '\n\n' + faker.lorem.paragraph();
        }

        const post = await prisma.post.create({
            data: {
                author: author.id,
                message,
                createdAt: new Date(),
            },
        });

        posts.push(post);

        if ((i + 1) % 1000 === 0) {
            console.log(`  📝 ${i + 1}/10000 posts créés`);
        }
    }

    console.log('🔗 Création des associations posts-tags...');

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const numTags = faker.datatype.number({ min: 1, max: 5 });
        const selectedTags = faker.helpers.arrayElements(tags, numTags);

        for (const tag of selectedTags) {
            try {
                await prisma.asso11.create({
                    data: {
                        idTag: tag.idTag,
                        idPost: post.id,
                        author: post.author,
                    },
                });
            } catch (error) {
            }
        }

        if ((i + 1) % 1000 === 0) {
            console.log(`  🔗 ${i + 1}/10000 associations créées`);
        }
    }

    console.log('❤️ Création des likes...');
    const likesCount = Math.floor(posts.length * 0.3);

    for (let i = 0; i < likesCount; i++) {
        const post = faker.helpers.arrayElement(posts);
        const user = faker.helpers.arrayElement(users);

        try {
            await prisma.likePost.create({
                data: {
                    idPost: post.id,
                    author: user.id,
                },
            });
        } catch (error) {
        }
    }

    console.log('👥 Création des relations de suivi...');
    const followsCount = users.length * 5;

    for (let i = 0; i < followsCount; i++) {
        const follower = faker.helpers.arrayElement(users);
        const followed = faker.helpers.arrayElement(users);

        if (follower.id !== followed.id) {
            try {
                await prisma.follow.create({
                    data: {
                        followerId: follower.id,
                        followedId: followed.id,
                    },
                });
            } catch (error) {
            }
        }
    }

    console.log('💬 Création des commentaires...');
    const commentsCount = Math.floor(posts.length * 0.1);

    for (let i = 0; i < commentsCount; i++) {
        const originalPost = faker.helpers.arrayElement(posts);
        const author = faker.helpers.arrayElement(users);

        const commentPost = await prisma.post.create({
            data: {
                author: author.id,
                message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 3 })),
                createdAt: faker.date.between(originalPost.createdAt, new Date()),
            },
        });

        await prisma.commentPost.create({
            data: {
                commentId: commentPost.id,
                postId: originalPost.id,
            },
        });
    }

    console.log('✅ Seeding terminé!');
    console.log(`
📊 Résumé:
- Utilisateurs: ${users.length}
- Tags: ${tags.length}
- Posts: ${posts.length}
- Associations posts-tags: créées
- Likes: ~${likesCount}
- Follows: ~${followsCount}
- Commentaires: ~${commentsCount}
  `);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });