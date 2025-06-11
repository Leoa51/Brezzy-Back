const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
            type: String,
            default: ''
        },
        video: {
            type: String,
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

conversationSchema.pre('save', function(next) {
    if (this.messages && this.messages.length > 0) {
        this.lastMessage = this.messages[this.messages.length - 1].date_message;
    }
    next();
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessage: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;