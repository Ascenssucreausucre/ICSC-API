const { News } = require("../models");
const { Op } = require("sequelize");

// ====================== MÉTHODES "DATA" ====================== //

// Récupère toutes les news
exports.getAllNewsData = async () => {
  return await News.findAll();
};

// Récupère une news par ID
exports.getNewsByIdData = async (id) => {
  return await News.findByPk(id);
};

exports.getNewsByConference = async (conference_id) => {
  return await News.findAll({
    where: { conference_id },
  });
};

// Récupère les news en fonction des dates
exports.getNewsByTimeStampData = async () => {
  try {
    const currentDate = new Date();
    const news = await News.findAll({
      where: {
        from_date: { [Op.lte]: currentDate },
        to_date: { [Op.gte]: currentDate },
      },
    });

    if (news.length === 0) {
      const error = new Error("No news found for the current date range");
      error.statusCode = 404;
      throw error;
    }

    return news;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

// ====================== MÉTHODES "HTTP" ====================== //

// Récupère toutes les news
exports.getAllNews = async (req, res) => {
  try {
    const news = await exports.getAllNewsData();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupère une news par ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const targetedNews = await exports.getNewsByIdData(id);

    if (!targetedNews) {
      return res.status(404).json({ message: "News non trouvée" });
    }

    res.status(200).json(targetedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupère les news en cours
exports.getNewsByTimeStamp = async (req, res) => {
  try {
    const news = await exports.getNewsByTimeStampData();
    res.status(200).json(news);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Crée une news
exports.createNews = async (req, res) => {
  try {
    const targetedNews = await News.create(req.body);
    res.status(201).json({
      message: "News créée avec succès",
      id: targetedNews.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Met à jour une news
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await News.update(req.body, { where: { id } });

    if (updated[0] === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({
      message: "News updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the news",
    });
  }
};

// Supprime une news par ID
exports.deleteNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await News.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    return res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while deleting the news: " + error.message,
    });
  }
};

// Supprime les news expirées
exports.deletePastNews = async (req, res) => {
  try {
    const currentDate = new Date();
    const deletedCount = await News.destroy({
      where: { to_date: { [Op.lt]: currentDate } },
    });

    return res.status(200).json({
      message:
        deletedCount > 0
          ? `${deletedCount} news deleted successfully`
          : "No past news found",
    });
  } catch (error) {
    console.error("Error while deleting past news:", error);
    res.status(500).json({ error: error.message });
  }
};
