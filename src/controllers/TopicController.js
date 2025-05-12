const { Topic, Content } = require("../models");

// ========================== Récupération des données ========================== //

exports.getTopicData = async (conference_id) => {
  return await Topic.findAll({
    where: { conference_id },
    include: [
      {
        model: Content,
        as: "contents",
        attributes: ["text"],
      },
    ],
  });
};

// ========================== Routes HTTP ========================== //

exports.getAllTopicsWithContent = async (req, res) => {
  try {
    const topics = await exports.getTopicData();

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      content: topic.contents.map((c) => c.text),
    }));

    res.status(200).json(formattedTopics);
  } catch (error) {
    console.error("Erreur lors de la récupération des topics :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.createTopicWithContent = async (req, res) => {
  const { title, conference_id, content = [] } = req.body;

  if (!conference_id) {
    return res.status(500).json({
      error: "No conference id sent.",
    });
  }

  try {
    // Transaction pour garantir la cohérence des données
    const result = await Topic.sequelize.transaction(async (t) => {
      const topic = await Topic.create(
        { title, conference_id },
        { transaction: t }
      );

      const contentData = content.map((contentText) => ({
        text: contentText,
        topic_id: topic.id,
      }));

      await Content.bulkCreate(contentData, { transaction: t });

      return topic;
    });

    res.status(201).json({
      message: "Topic successfully created!",
      id: result.id,
      conference_id: result.conference_id,
      title: result.title,
      content,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Topic.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the topic" });
  }
};

exports.updateTopicWithContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content = [] } = req.body;

    const topic = await Topic.findOne({ where: { id } });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Transaction pour garantir que la mise à jour soit cohérente
    await Topic.sequelize.transaction(async (t) => {
      // Mise à jour du titre
      topic.title = title || topic.title;
      await topic.save({ transaction: t });

      // Mise à jour du contenu
      const existingContents = await topic.getContents({ transaction: t });

      // Supprimer les contenus qui ne sont plus dans le tableau
      const contentToDelete = existingContents.filter(
        (existingContent) => !content.includes(existingContent.text)
      );

      for (const contentToRemove of contentToDelete) {
        await contentToRemove.destroy({ transaction: t });
      }

      // Ajouter les nouveaux contenus
      for (const text of content) {
        const existingContent = existingContents.find((ec) => ec.text === text);
        if (!existingContent) {
          await Content.create(
            { text, topic_id: topic.id },
            { transaction: t }
          );
        }
      }
    });

    res.status(200).json({ message: "Topic updated successfully", topic });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the topic" });
  }
};

exports.getCurrentTopicsWithContent = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const topics = await exports.getTopicData(conference_id);

    if (topics.length === 0) {
      return res
        .status(404)
        .json({ error: "No topics found for this conference" });
    }

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      content: topic.contents.map((c) => c.text),
    }));

    res.status(200).json(formattedTopics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
