// controllers/ConferenceController.js
const { News } = require("../models");
const { Op } = require("sequelize");

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.findAll();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const targetedNews = await News.findByPk(req.params.id);
    if (!targetedNews) {
      return res.status(404).json({ message: "News non trouvée" });
    }
    res.json(targetedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
exports.getNewsByTimeStamp = async (req, res) => {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();

    // Chercher les news dont la date actuelle est dans l'intervalle de from_date et to_date
    const news = await News.findAll({
      where: {
        from_date: { [Op.lte]: currentDate }, // La date de début doit être avant ou égale à la date actuelle
        to_date: { [Op.gte]: currentDate }, // La date de fin doit être après ou égale à la date actuelle
      },
    });

    // Si des news sont trouvées, renvoyer les résultats
    if (news.length > 0) {
      res.status(200).json(news);
    } else {
      res
        .status(404)
        .json({ message: "No news found for the current date range" });
    }
  } catch (error) {
    console.error("Error while fetching news:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const newsData = req.body;

    const newsToUpdate = await News.findOne({
      where: { id },
    });

    if (!newsToUpdate) {
      return res.status(404).json({ message: "News not found" });
    }

    newsToUpdate.title = newsData.title || newsToUpdate.title;
    newsToUpdate.icon = newsData.icon || newsToUpdate.icon;
    newsToUpdate.from_date = newsData.from_date || newsToUpdate.from_date;
    newsToUpdate.to_date = newsData.to_date || newsToUpdate.to_date;
    newsToUpdate.content = newsData.content || newsToUpdate.content;
    newsToUpdate.conference_id =
      newsData.conference_id || newsToUpdate.conference_id;

    await newsToUpdate.save();

    res.status(200).json({
      message: "News updated successfully",
      news: newsToUpdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the news",
    });
  }
};
exports.deleteNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await News.destroy({
      where: { id },
    });
    if (deleted === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    return res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while deleting the news :" + error.message,
    });
  }
};
exports.deletePastNews = async (req, res) => {
  try {
    const currentDate = new Date();

    const newsToDelete = await News.destroy({
      where: { to_date: { [Op.lt]: currentDate } },
    });
    if (newsToDelete > 0) {
      res
        .status(200)
        .json({ message: `${newsToDelete} news deleted successfully` });
    } else {
      res.status(404).json({ message: `No news found` });
    }
  } catch (error) {
    console.error("Error while deleting past news:", error);
    res.status(500).json({ error: error.message });
  }
};
