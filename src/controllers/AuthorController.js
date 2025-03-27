const { Author } = require("../models");

exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll();
    if (authors) {
      res.status(200).json(authors);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const newAuthor = await Author.create(req.body);
    res.status(201).json({
      message: "Author successfully created",
      id: newAuthor.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const authorData = req.body;

    const authorToUpdate = await Author.findOne({
      where: { id },
    });

    if (!authorToUpdate) {
      return res.status(404).json({ message: "Author not found" });
    }

    authorToUpdate.name = authorData.name || authorToUpdate.name;
    authorToUpdate.surname = authorData.surname || authorToUpdate.surname;
    authorToUpdate.country = authorData.country || authorToUpdate.country;

    await authorToUpdate.save();

    res.status(200).json({
      message: "Author successfully updated",
      author: authorToUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAuthor = await Author.destroy({
      where: { id },
    });

    if (deletedAuthor > 0) {
      res.status(200).json({
        message: "Author deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "Author not found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
