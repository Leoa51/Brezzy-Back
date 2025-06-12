import Conversation from '../models/conversation.model.js'

export async function createConversation(req, res){
    const { participants } = req.body;
    if (!participants) return res.status(400).send("participants is required");
    try {
        const newConversation = new Conversation({ participants });
        await newConversation.save();

        res.status(201).send("Conversation created successfully");
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export async function getAllConversations (req, res)  {
    try {
        const conversations = await Conversation.find();
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
}


export async function deleteConversation (req, res)  {
    try {
        const conversations = await Conversation.findByIdAndDelete(req.params.id);
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function getConversationById(req, res) {
    try {
        const conversations = await Conversation.findById(req.params.id);
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
}

export async function modifyConversation (req, res)  {
    try {
        const conversations = await Conversation.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
}
