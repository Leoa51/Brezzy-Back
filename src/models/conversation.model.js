// Import de la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition d'un schéma pour une collection de conversations
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // Référence vers les utilisateurs participants
        required: true
    }],
    messages: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        date_message: {
            type: Date,
            default: Date.now
        },
        picture: {
            type: String,   // URL ou chemin vers l'image
            default: ''
        },
        video: {
            type: String,   // URL ou chemin vers la vidéo
            default: ''
        },
        isRead: {
            type: Boolean,
            default: false
        }
    }],
    lastMessage: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour lastMessage automatiquement
conversationSchema.pre('save', function(next) {
    if (this.messages && this.messages.length > 0) {
        this.lastMessage = this.messages[this.messages.length - 1].date_message;
    }
    next();
});

// Index pour optimiser les recherches par participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessage: -1 });

// Création d'un modèle basé sur le schéma
const Conversation = mongoose.model('Conversation', conversationSchema);

// Exporte le modèle Conversation pour qu'il soit utilisé dans d'autres fichiers
module.exports = Conversation;