  
const mongoose = require('mongoose');
  
const postSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    picture: {
        type: String,
        default: ''
    },
    video: {
        type: String,
        default: ''
    },
    id_Tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    like_Number: {
        type: Number,
        default: 0
    },
    likedBy: [{           // added to track who liked
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
  
postSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
  
const Post = mongoose.model('Post', postSchema);
  
module.exports = Post;