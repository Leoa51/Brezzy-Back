// Import de la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition d'un schéma pour une collection d'utilisateurs
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'], // Définit les rôles possibles
        default: 'user'
    },
    username: {
        type: String,
        required: true,
        unique: true,       // Le nom d'utilisateur doit être unique
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    mail: {
        type: String,
        required: true,
        unique: true,       // L'email doit être unique
        lowercase: true,    // Convertit automatiquement en minuscules
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6        // Mot de passe minimum 6 caractères
    },
    bio: {
        type: String,
        maxlength: 500,     // Bio limitée à 500 caractères
        default: ''
    },
    pdp: {
        type: String,       // URL ou chemin vers la photo de profil
        default: ''
    },
    follow_People: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'         // Référence vers d'autres utilisateurs
    }],
    followed_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'         // Référence vers d'autres utilisateurs
    }],
    langage: {
        type: String,
        default: 'fr',      // Langue par défaut
        enum: ['fr', 'en', 'es', 'de', 'it'] // Langues supportées
    },
    signalement_user: [{
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
    isBlocked: {
        type: Boolean,
        default: false
    },
    nb_Report: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Création d'un modèle basé sur le schéma
const User = mongoose.model('User', userSchema);

// Exporte le modèle User pour qu'il soit utilisé dans d'autres fichiers
module.exports = User;