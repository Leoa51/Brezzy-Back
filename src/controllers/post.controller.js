
module.exports = {
    // Fonction asynchrone pour créer une nouvelle tâche.
    createPost: async (req, res) => {
        // Extraction des données de la requête : titre et contenu de la tâche.
        const { message, author } = req.body;

        // Vérification que le titre et le contenu sont présents.
        // Si l'un des deux est manquant, on retourne une réponse avec un statut 400 (Bad Request).
        if (!message || !author) return res.status(400).send("Title and content are required");

        try {
            // Création et sauvegarde d'une nouvelle tâche dans la base de données
            const newPost = new Post({ message, author });
            await newPost.save();

            // Envoi d'une réponse avec un statut 201 (Created) pour indiquer que la tâche a été créée avec succès.
            res.status(201).send("Post created successfully");
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            console.log(err);
            res.status(500).json(err);
        }
    },


    // Fonction asynchrone pour récupérer toutes les tâches.
    getAllPosts: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const posts = await Post.find();
            res.status(200).json(posts);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },


    deletePost: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const posts = await Post.findByIdAndDelete(req.params.id);
            res.status(200).json(posts);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    getPostById: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const posts = await Post.findById(req.params.id);
            res.status(200).json(posts);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    modifyPost: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const posts = await Post.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(posts);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

};