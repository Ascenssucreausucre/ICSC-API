const { Author, SpecialSession } = require("../models");

exports.create = async (req, res) => {
  const transaction = await SpecialSession.sequelize.transaction();
  try {
    const { title, summary, conference_id, authors } = req.body;

    const authorIds = authors.map((a) => a.id);

    const session = await SpecialSession.create(
      { title, summary, conference_id },
      { transaction }
    );

    await session.setAuthors(authorIds, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: `Special session "${title}" successfully created.`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};

exports.getAllData = async () => {
  try {
    return await SpecialSession.findAll({
      include: {
        model: Author,
        as: "authors",
      },
    });
  } catch (error) {
    throw error;
  }
};

exports.getAll = async (req, res) => {
  try {
    const sessions = await exports.getAllData();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};

exports.getByConferenceData = async (conference_id) => {
  try {
    return await SpecialSession.findAll({
      where: { conference_id },
      include: {
        model: Author,
        as: "authors",
        through: {
          attributes: [],
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

exports.getByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const sessions = await exports.getByConferenceData(conference_id);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};

exports.update = async (req, res) => {
  const transaction = await SpecialSession.sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, summary, conference_id, authors } = req.body;

    const authorIds = authors.map((a) => a.id);

    const session = await SpecialSession.findByPk(id);

    await session.update({ title, summary, conference_id }, { transaction });

    await session.setAuthors(authorIds, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: `Special session "${title}" successfully updated.`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionToDelete = await SpecialSession.destroy({
      where: { id },
    });
    if (!sessionToDelete || sessionToDelete.length === 0) {
      return res.status(404).json({
        error: `No special session found with id ${id}`,
      });
    }
    res.status(200).json({
      message: `Session ${id} successfully deleted.`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};
