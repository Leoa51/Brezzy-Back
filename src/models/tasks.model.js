// Import de la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require('mongoose');

// Définition d'un schéma pour une collection de tâches
// const taskSchema = new mongoose.Schema({
//     title: {
//         type: String,       // Type de données : String (chaîne de caractères)
//         required: true      // Ce champ est obligatoire
//     },
//     content: {
//         type: String,       // Type de données : String (chaîne de caractères)
//         required: true      // Ce champ est également obligatoire
//     },
//     createdAt: {
//         type: Date,         // Type de données : Date
//         default: Date.now   // Valeur par défaut : la date actuelle
//     },
//     completed: {
//         type: Boolean,      // Type de données : Boolean (vrai ou faux)
//         default: false      // Valeur par défaut : faux (non complété)
//     }
// });

const taskSchema = new mongoose.Schema({
    title: {
        type: String,       // Type de données : String (chaîne de caractères)
        required: true      // Ce champ est obligatoire
    },
    content: {
        type: String,       // Type de données : String (chaîne de caractères)
        required: true      // Ce champ est également obligatoire
    },
    createdAt: {
        type: Date,         // Type de données : Date
        default: Date.now   // Valeur par défaut : la date actuelle
    },
    completed: {
        type: Boolean,      // Type de données : Boolean (vrai ou faux)
        default: false      // Valeur par défaut : faux (non complété)
    }
});

// Création d'un modèle basé sur le schéma
const Task = mongoose.model('Task', taskSchema);

// Exporte le modèle Task pour qu'il soit utilisé dans d'autres fichiers
module.exports = Task;