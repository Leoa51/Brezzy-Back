// Import de la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition d'un schéma pour une collection de tags
const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,       // Le nom du tag doit être unique
        trim: true,
        lowercase: true,    // Convertit automatiquement en minuscules
        maxlength: 50       // Limite la longueur du tag
    },
    description: {
        type: String,
        maxlength: 200,
        default: ''
    },
    usageCount: {
        type: Number,
        default: 0          // Compte le nombre de fois que le tag est utilisé
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'         // Référence vers l'utilisateur qui a créé le tag
    }
});

// Index pour optimiser les recherches par nom
tagSchema.index({ name: 1 });
tagSchema.index({ usageCount: -1 });

// Création d'un modèle basé sur le schéma
const Tag = mongoose.model('Tag', tagSchema);

// Exporte le modèle Tag pour qu'il soit utilisé dans d'autres fichiers
module.exports = Tag;