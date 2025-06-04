const ImportExceldata = require("../middleware/importExcel");
const { Article, Author } = require("../models");
const fs = require("fs/promises");
const path = require("path");

exports.createArticle = async (req, res) => {
  const { authors, ...articleData } = req.body;

  if (!authors || !Array.isArray(authors) || authors.length === 0) {
    return res.status(400).json({
      error: "At least one valid author is required to create an article",
    });
  }

  try {
    const result = await Article.sequelize.transaction(async (t) => {
      // Vérifie que les auteurs existent
      const authorIds = authors.map((a) => a.id);

      const existingAuthors = await Author.findAll({
        where: { id: authorIds },
        transaction: t,
      });

      if (existingAuthors.length !== authors.length) {
        throw new Error("One or more authors do not exist");
      }

      // Crée l'article
      const newArticle = await Article.create(articleData, { transaction: t });

      // Associe les auteurs
      await newArticle.setAuthors(authorIds, { transaction: t });

      return { newArticle, existingAuthors };
    });

    res.status(201).json({
      message: "Article successfully created",
      article: {
        id: result.newArticle.id,
        ...articleData,
        authors: result.existingAuthors.map((a) => ({
          id: a.id,
          name: a.name,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: error.message });
  }
};

// Méthode Data pour récupérer tous les articles
exports.findAllArticlesData = async () => {
  return await Article.findAll({
    include: {
      model: Author,
      as: "authors",
    },
  });
};

exports.findArticlesByConferenceData = async (conference_id) => {
  return await Article.findAll({
    where: { conference_id },
    include: {
      model: Author,
      as: "authors",
      through: { attributes: [] },
    },
  });
};

exports.findArticlesByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const Articles = await exports.findArticlesByConferenceData(conference_id);

    if (Articles.length === 0) {
      res.status(404).json({
        error: "No article found for this conference.",
      });
    }

    res.status(200).json(Articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint HTTP pour récupérer tous les articles
exports.findAllArticles = async (req, res) => {
  try {
    const allArticles = await exports.findAllArticlesData();
    res.status(200).json(allArticles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode Data pour trouver les articles par auteur
exports.findArticleByAuthorData = async (authorId) => {
  // Trouver tous les articles associés à cet auteur
  const articles = await Article.findAll({
    include: {
      model: Author,
      as: "authors", // Assurez-vous que l'alias est bien "authors"
      where: { id: authorId }, // Filtrer les articles où l'auteur correspond à l'ID
      required: true, // Cela assure qu'on ne récupère que les articles ayant cet auteur
    },
  });

  // Si aucun article n'est trouvé pour cet auteur
  if (articles.length === 0) {
    const error = new Error("No articles found for this author");
    error.statusCode = 404;
    throw error;
  }

  // Rechercher tous les auteurs associés à chaque article
  const articlesWithAllAuthors = await Promise.all(
    articles.map(async (article) => {
      return await Article.findByPk(article.id, {
        include: {
          model: Author,
          as: "authors", // Inclure tous les auteurs de l'article
        },
      });
    })
  );

  return articlesWithAllAuthors;
};

// Endpoint HTTP pour trouver les articles par auteur
exports.findArticleByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const articles = await exports.findArticleByAuthorData(authorId);
    res.status(200).json(articles);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.deleteArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.destroy({
      where: { id },
    });
    if (deletedArticle === 0) {
      return res.status(404).json({
        error: "Article not found",
      });
    }
    res.status(200).json({
      message: "Article successfully deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, affiliation, authors } = req.body; // `authors` est un tableau d'IDs d'auteurs

    const authorsIds = authors.map((a) => a.id);

    // 1️⃣ Trouver l'article à mettre à jour
    const articleToUpdate = await Article.findByPk(id, {
      include: { model: Author, as: "authors" }, // Inclure les auteurs actuels
    });

    if (!articleToUpdate) {
      return res.status(404).json({ error: "Article not found" });
    }

    // 2️⃣ Mettre à jour les autres champs
    articleToUpdate.title = title || articleToUpdate.title;
    articleToUpdate.affiliation = affiliation || articleToUpdate.affiliation;
    await articleToUpdate.save();

    // 3️⃣ Mettre à jour les auteurs si renseigné
    if (authorsIds && Array.isArray(authorsIds)) {
      const currentAuthorIds = articleToUpdate.authors.map((a) => a.id); // IDs actuels
      const newAuthorIds = authorsIds; // Nouveaux IDs fournis

      // Vérifier si tous les nouveaux auteurs existent
      const authorsExist = await Author.findAll({
        where: { id: newAuthorIds },
      });

      // Si l'un des auteurs n'existe pas, renvoyer une erreur 404 avec l'ID manquant
      const existingAuthorIds = authorsExist.map((author) => author.id);
      const notFoundAuthors = newAuthorIds.filter(
        (id) => !existingAuthorIds.includes(id)
      );

      if (notFoundAuthors.length > 0) {
        return res.status(404).json({
          error: `Author(s) with ID(s) ${notFoundAuthors.join(", ")} not found`,
        });
      }

      // Trouver les auteurs à AJOUTER (ceux qui ne sont pas encore liés)
      const authorsToAdd = newAuthorIds.filter(
        (id) => !currentAuthorIds.includes(id)
      );

      // Trouver les auteurs à SUPPRIMER (ceux qui ne sont plus dans la liste)
      const authorsToRemove = currentAuthorIds.filter(
        (id) => !newAuthorIds.includes(id)
      );

      // Ajouter les nouveaux auteurs
      if (authorsToAdd.length > 0) {
        await articleToUpdate.addAuthors(authorsToAdd);
      }

      // Supprimer les auteurs non inclus dans la nouvelle liste
      if (authorsToRemove.length > 0) {
        await articleToUpdate.removeAuthors(authorsToRemove);
      }
    }

    res.status(200).json({
      message: "Article updated successfully",
      article: articleToUpdate,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        error: "No article found",
      });
    }

    article.status = status;
    article.save();

    res.status(200).json({
      message: `Article status changed to "${
        String(status).charAt(0).toUpperCase() + String(status).slice(1)
      }" successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      error: `Internal server error : ${error}`,
    });
  }
};

exports.bulkUpdateArticleStatus = async (req, res) => {
  try {
    const { ids } = req.body; // Le tableau d'IDs doit être dans le corps de la requête
    const { status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array." });
    }

    // Trouver tous les articles correspondant aux IDs
    const articles = await Article.findAll({ where: { id: ids } });

    if (articles.length === 0) {
      return res
        .status(404)
        .json({ error: "No articles found for the provided IDs." });
    }

    // Mettre à jour le statut pour tous les articles
    await Promise.all(
      articles.map((article) => {
        article.status = status;
        return article.save();
      })
    );

    res.status(200).json({
      message: `Status of ${articles.length} article(s) updated to "${
        String(status).charAt(0).toUpperCase() + String(status).slice(1)
      }".`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

exports.importByFile = async (req, res) => {
  const filePath = req?.file.path;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const conferenceId = req.body.conference_id;
    if (!conferenceId) {
      return res.status(400).json({ error: "Conference id is required." });
    }

    await ImportExceldata(filePath, conferenceId);

    return res.status(200).json({ message: "Importation successful." });
  } catch (error) {
    console.error("Erreur d'importation :", error.message);
    return res
      .status(500)
      .json({ error: "Error during importation: " + error.message });
  } finally {
    await fs.unlink(path.join(filePath)).catch(() => {});
  }
};
