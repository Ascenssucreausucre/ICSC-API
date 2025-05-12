const { LocalInformation } = require("../models");
const path = require("path");
const fs = require("fs/promises");

exports.create = async (req, res) => {
  const transaction = await LocalInformation.sequelize.transaction();
  const folder = req.uploadFolder || "local-informations";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;
  try {
    const { title, text, conference_id } = req.body;
    const localInfo = await LocalInformation.create(
      { title, text, file: uploadedFile, conference_id },
      { transaction }
    );
    await transaction.commit();
    res.status(201).json({
      message: `Local information ${localInfo.title} successfully created.`,
    });
  } catch (error) {
    await transaction.rollback();
    if (uploadedFile) {
      await fs
        .unlink(path.join("public/uploads", uploadedFile))
        .catch(() => {});
    }
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

exports.getByConferenceData = async (conference_id) => {
  try {
    return await LocalInformation.findAll({
      where: { conference_id },
    });
  } catch (error) {
    throw error;
  }
};

exports.getByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const localInfos = await exports.getByConferenceData(conference_id);
    res.status(200).json(localInfos);
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const localInfo = await LocalInformation.findByPk(id);
    if (!localInfo) {
      return res
        .status(404)
        .json({ error: `No local information found with id ${id}` });
    }
    res.status(200).json(localInfo);
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

exports.update = async (req, res) => {
  const transaction = await LocalInformation.sequelize.transaction();
  const folder = req.uploadFolder || "local-informations";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const { id } = req.params;
    const { title, text } = req.body;

    const localInfo = await LocalInformation.findByPk(id);

    if (!localInfo) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: `No local information found with id ${id}` });
    }
    let newFile = localInfo.file;
    if (uploadedFile) {
      if (localInfo.file) {
        const oldFilePath = path.join("public/uploads", localInfo.file);
        await fs.unlink(oldFilePath).catch(() => {});
      }
      newFile = uploadedFile;
    }
    await localInfo.update({ title, text, file: newFile }, { transaction });
    transaction.commit();
    return res
      .status(200)
      .json({ message: `Local info ${localInfo.title} successfully updated.` });
  } catch (error) {
    await transaction.rollback();
    if (uploadedFile) {
      await fs
        .unlink(path.join("public/uploads", uploadedFile))
        .catch(() => {});
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
    console.error(error.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const localInfo = await LocalInformation.findByPk(id);

    if (!localInfo) {
      return res
        .status(404)
        .json({ error: `No local information found with id ${id}` });
    }

    if (localInfo.file) {
      await fs
        .unlink(path.join("public/uploads", localInfo.file))
        .catch(() => {});
    }

    await localInfo.destroy();

    res
      .status(200)
      .json({ message: `Local information successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
