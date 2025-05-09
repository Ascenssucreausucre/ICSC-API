const { Author, Article } = require("../models");
const { Op, Sequelize } = require("sequelize");

exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll();
    if (!authors) {
      return res.status(404).json({
        error: "No author found.",
      });
    }
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAuthorsWithArticles = async (req, res) => {
  try {
    const authors = await Author.findAll({
      include: {
        model: Article,
        as: "articles",
        attributes: ["id"],
        through: { attributes: [] },
      },
    });
    if (!authors) {
      return res.status(404).json({
        error: "No author found.",
      });
    }
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAuthorByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const authors = await Author.findOne({
      where: { id },
      include: {
        model: Article,
        as: "articles",
        through: { attributes: [] },
        include: {
          model: Author,
          as: "authors",
          through: { attributes: [] },
        },
      },
    });
    if (!authors) {
      return res.status(404).json({
        error: "No author found with id " + id,
      });
    }
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const newAuthor = await Author.create(req.body);
    res.status(201).json({
      message: "Author successfully created",
      newItem: newAuthor,
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
      return res.status(404).json({ error: "Author not found" });
    }

    authorToUpdate.name = authorData.name || authorToUpdate.name;
    authorToUpdate.surname = authorData.surname || authorToUpdate.surname;
    authorToUpdate.country = authorData.country || authorToUpdate.country;
    authorToUpdate.title = authorData.title || authorToUpdate.title;
    authorToUpdate.affiliation =
      authorData.affiliation || authorToUpdate.affiliation;

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
        error: "Author not found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchAuthors = async (req, res) => {
  try {
    const {
      search = "", // texte de recherche
      country, // filtre optionnel par pays
      affiliation, // filtre optionnel par affiliation
      page = 1, // pagination
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;
    const searchWords = search
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const whereClause = {
      ...(country && { country }),
      ...(affiliation && { affiliation }),
    };

    // Ajouter la condition de recherche seulement si des mots de recherche sont fournis
    if (searchWords.length > 0) {
      whereClause[Op.and] = searchWords.map((word) => ({
        [Op.or]: [
          { name: { [Op.like]: `%${word}%` } },
          { surname: { [Op.like]: `%${word}%` } },
          { country: { [Op.like]: `%${word}%` } },
          { affiliation: { [Op.like]: `%${word}%` } },
        ],
      }));
    }

    const authors = await Author.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["surname", "ASC"]],
      include: {
        model: Article,
        as: "articles",
        attributes: ["id"],
        through: { attributes: [] },
      },
    });

    const count = await Author.count();

    res.status(200).json({
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit),
      results: authors,
    });
  } catch (error) {
    console.error("Erreur de recherche:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDistinctCountries = async (req, res) => {
  try {
    const countries = await Author.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("country")), "country"],
      ],
      where: {
        country: { [Op.ne]: null }, // exclut les NULL
      },
      order: [["country", "ASC"]],
    });

    res.status(200).json(countries.map((c) => c.country));
  } catch (error) {
    console.error("Erreur récupération des pays:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDistinctAffiliations = async (req, res) => {
  try {
    const affiliations = await Author.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("affiliation")), "affiliation"],
      ],
      where: {
        affiliation: { [Op.ne]: null },
      },
      order: [["affiliation", "ASC"]],
    });

    res.status(200).json(affiliations.map((a) => a.affiliation));
  } catch (error) {
    console.error("Erreur récupération des affiliations:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getFilters = async (req, res) => {
  try {
    const affiliations = await Author.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("affiliation")), "affiliation"],
      ],
      where: {
        affiliation: { [Op.ne]: null },
      },
      order: [["affiliation", "ASC"]],
    });

    const countries = await Author.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("country")), "country"],
      ],
      where: {
        country: { [Op.ne]: null }, // exclut les NULL
      },
      order: [["country", "ASC"]],
    });

    res.status(200).json({
      affiliations: affiliations.map((a) => a.affiliation),
      countries: countries.map((a) => a.country),
    });
  } catch (error) {
    console.error("Erreur récupération des affiliations:", error);
    res.status(500).json({ error: error.message });
  }
};
