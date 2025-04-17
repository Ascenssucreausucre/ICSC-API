const { Article, Author } = require("../models"); // Remplacer "../models" par le chemin correct vers tes modèles
const { Op } = require("sequelize");

exports.createArticle = async (req, res) => {
  try {
    const { authors, ...articleData } = req.body;

    const newArticle = await Article.create(articleData);

    if (!authors || authors.length === 0) {
      return res.status(400).json({
        error: "At least one author is required to create an article",
      });
    }

    await newArticle.setAuthors(authors);

    res.status(201).json({
      message: "Article successfully created",
      id: newArticle.id,
      authors: authors,
    });
  } catch (error) {
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
    if (authors && Array.isArray(authors)) {
      const currentAuthorIds = articleToUpdate.authors.map((a) => a.id); // IDs actuels
      const newAuthorIds = authors; // Nouveaux IDs fournis

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
