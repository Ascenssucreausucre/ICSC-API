const { Topic } = require("../models");
const { Content } = require("../models");

exports.getAllTopicsWithContent = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [
        {
          model: Content,
          as: "contents",
          attributes: ["text"],
        },
      ],
    });

    // Reformater les données pour correspondre à la structure demandée
    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      content: topic.contents.map((c) => c.text),
    }));

    res.status(200).json(formattedTopics);
  } catch (error) {
    console.error("Erreur lors de la récupération des topics :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.createTopicWithContent = async (req, res) => {
  const { title, conference_id, contents } = req.body; // `contents` est un tableau de strings optionnel

  try {
    // Création du topic
    const topic = await Topic.create({ title, conference_id });

    // Si des contents sont fournis, les créer et les associer au topic
    if (contents && contents.length > 0) {
      const contentData = contents.map((contentText) => ({
        text: contentText,
        topic_id: topic.id,
      }));

      await Content.bulkCreate(contentData);
    }

    // Réponse avec l'ID du topic et ses contents
    res.status(201).json({
      message: "Topic successfully created!",
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      contents: contents || [],
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Topic.destroy({
      where: {
        id: id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while deleting the topic" + error.message,
    });
  }
};

exports.updateTopicWithContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body; // Le contenu doit être un tableau ou un seul objet selon ce que tu veux faire

    // 1. Trouver le topic
    const topic = await Topic.findOne({ where: { id } });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // 2. Mise à jour du titre du topic
    topic.title = title;

    // 3. Mise à jour du content si il y a des données dans le body
    if (content && Array.isArray(content)) {
      // Si "content" est un tableau, on veut gérer les content existants et en ajouter de nouveaux

      // Récupérer tous les contents existants pour ce topic
      const existingContents = await topic.getContents();

      // 3.1 Supprimer les contents qui ne sont plus dans le tableau "content"
      const contentToDelete = existingContents.filter(
        (existingContent) => !content.includes(existingContent.text)
      );

      for (const contentToRemove of contentToDelete) {
        await contentToRemove.destroy(); // Supprimer les contenus qui ne sont plus associés
      }

      // 3.2 Ajouter les nouveaux contents qui ne sont pas encore dans la base
      for (const text of content) {
        // Vérifie si ce contenu existe déjà pour ce topic
        const existingContent = existingContents.find(
          (existingContent) => existingContent.text === text
        );

        if (!existingContent) {
          // Créer un nouveau contenu si ce n'est pas trouvé
          await Content.create({ text, topic_id: topic.id });
        }
      }
    }

    // Sauvegarde du topic après mise à jour
    await topic.save();

    return res.status(200).json({
      message: "Topic updated successfully",
      topic,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the topic",
    });
  }
};
