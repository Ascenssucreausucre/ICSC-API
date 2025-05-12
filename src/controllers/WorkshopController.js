const path = require("path");
const fs = require("fs/promises");
const { Workshop } = require("../models");

exports.create = async (req, res) => {
  const transaction = await Workshop.sequelize.transaction();
  const folder = req.uploadFolder || "workshop-files";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const { title, text, date_from, date_to, presenters, conference_id } =
      req.body;

    const workshop = await Workshop.create(
      {
        title,
        text,
        additionnal_file: uploadedFile,
        date_from,
        date_to,
        presenters,
        conference_id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({
      message: `Workshop ${workshop.title} successfully created`,
      newItem: workshop,
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

exports.getAll = async (req, res) => {
  try {
    const workshops = await Workshop.findAll();
    res.status(200).json(workshops);
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

exports.getByConferenceData = async (conference_id) => {
  return await Workshop.findAll({ where: { conference_id } });
};

exports.getByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const workshops = await exports.getByConferenceData(conference_id);
    res.status(200).json(workshops);
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

exports.update = async (req, res) => {
  const transaction = await Workshop.sequelize.transaction();
  const folder = req.uploadFolder || "workshop-files";
  const uploadedFile = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const { id } = req.params;
    const { title, text, date_from, date_to, presenters, conference_id } =
      req.body;

    const workshop = await Workshop.findByPk(id);
    if (!workshop) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: `No workshop with id ${id} found.` });
    }

    let newFile = workshop.additionnal_file;

    if (uploadedFile) {
      if (workshop.additionnal_file) {
        const oldFilePath = path.join(
          "public/uploads",
          workshop.additionnal_file
        );
        await fs.unlink(oldFilePath).catch(() => {});
      }
      newFile = uploadedFile;
    }

    await workshop.update(
      {
        title,
        text,
        additionnal_file: newFile,
        date_from,
        date_to,
        presenters,
        conference_id,
      },
      { transaction }
    );

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Workshop successfully updated.", newItem: workshop });
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
    const workshop = await Workshop.findByPk(id);
    if (!workshop) {
      return res
        .status(404)
        .json({ error: `No workshop found with id ${id}.` });
    }

    if (workshop.additionnal_file) {
      await fs
        .unlink(path.join("public/uploads", workshop.additionnal_file))
        .catch(() => {});
    }

    await workshop.destroy();
    res.status(200).json({ message: `Workshop ${id} successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
