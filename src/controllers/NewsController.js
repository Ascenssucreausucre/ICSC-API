const { News } = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs/promises");

exports.getAllNewsData = async () => {
  return await News.findAll();
};

exports.getNewsByIdData = async (id) => {
  return await News.findByPk(id);
};

exports.getNewsByConference = async (conference_id) => {
  return await News.findAll({
    where: { conference_id },
  });
};

exports.getNewsByTimeStampData = async () => {
  try {
    const currentDate = new Date();
    const news = await News.findAll({
      where: {
        from_date: { [Op.lte]: currentDate },
        to_date: { [Op.gte]: currentDate },
      },
    });

    return news;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const news = await exports.getAllNewsData();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const targetedNews = await exports.getNewsByIdData(id);

    if (!targetedNews) {
      return res.status(404).json({ error: "No news found" });
    }

    res.status(200).json(targetedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNewsByTimeStamp = async (req, res) => {
  try {
    const news = await exports.getNewsByTimeStampData();
    res.status(200).json(news);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.createNews = async (req, res) => {
  const folder = req.uploadFolder || "news-files";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const { title, content, from_date, to_date, icon, conference_id } =
      req.body;

    const newNews = await News.create({
      title,
      content,
      from_date,
      to_date,
      icon,
      conference_id,
      file: uploadedFile,
    });

    res.status(201).json({
      message: "News has been successfully created!",
      newItem: newNews,
    });
  } catch (error) {
    if (uploadedFile) {
      await fs
        .unlink(path.join("public/uploads", uploadedFile))
        .catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  const folder = req.uploadFolder || "news-files";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const { id } = req.params;
    const { title, content, from_date, to_date, icon, conference_id } =
      req.body;
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    let newFile = news.file;

    if (uploadedFile) {
      if (news.file) {
        await fs.unlink(path.join("public/uploads", news.file)).catch(() => {});
      }
      newFile = uploadedFile;
    }

    await news.update({
      title,
      content,
      from_date,
      to_date,
      icon,
      conference_id,
      file: newFile,
    });

    res
      .status(200)
      .json({ message: "News updated successfully", newItem: news });
  } catch (error) {
    if (uploadedFile) {
      await fs
        .unlink(path.join("public/uploads", uploadedFile))
        .catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.file) {
      await fs.unlink(path.join("public/uploads", news.file)).catch(() => {});
    }

    await news.destroy();

    return res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while deleting the news: " + error.message,
    });
  }
};

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
