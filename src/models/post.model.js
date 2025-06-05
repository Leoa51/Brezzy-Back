// Import de la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition d'un schéma pour une collection de posts
const postSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000     // Limite le message à 2000 caractères
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // Référence vers le modèle User
        required: true
    },
    picture: {
        type: String,       // URL ou chemin vers l'image
        default: ''
    },
    video: {
        type: String,       // URL ou chemin vers la vidéo
        default: ''
    },
    id_Tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'          // Référence vers le modèle Tag
    }],
    like_Number: {
        type: Number,
        default: 0
    },
    likedBy: [{           // Ajout pour tracker qui a liké
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comment: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        date: {
            type: Date,
            default: Date.now
        },
        likes: {
            type: Number,
            default: 0
        }
    }],
    signalement_Post: [{
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    nb_Report: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour updatedAt automatiquement
postSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Création d'un modèle basé sur le schéma
const Post = mongoose.model('Post', postSchema);

// Exporte le modèle Post pour qu'il soit utilisé dans d'autres fichiers
module.exports = Post;