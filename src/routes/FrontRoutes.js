require("dotenv").config();
const express = require("express");
const router = express.Router();
const ConferenceController = require("../controllers/ConferenceController");
const ImportantDatesController = require("../controllers/ImportantDatesController");
const TopicController = require("../controllers/TopicController");
const getCurrentConference = require("../middleware/getCurrentConference");
const SponsorController = require("../controllers/SponsorController");
const ArticleController = require("../controllers/ArticleController");
const CommitteeController = require("../controllers/CommitteeController");
const NewsController = require("../controllers/NewsController");
const RegistrationFeeController = require("../controllers/RegistrationFeeController");
const AdditionalFeeController = require("../controllers/AdditionalFeeController");
const PlenarySessionController = require("../controllers/PlenarySessionController");
const SpecialSessionController = require("../controllers/SpecialSessionController");
const WorkshopController = require("../controllers/WorkshopController");
const LocalInformationController = require("../controllers/LocalInformationController");
const {
  Article,
  Author,
  RegistrationFee,
  FeeCategory,
  AdditionalFee,
  PaymentOption,
  Sponsor,
  Contact,
  Conference,
  Registration,
} = require("../models");
const { Op } = require("sequelize");
const {
  verifyPaymentInformations,
  handleValidationErrors,
} = require("../middleware/validators");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

router.get("/homepage-data", getCurrentConference, async (req, res) => {
  try {
    const conferenceData =
      await ConferenceController.getCurrentConferenceData();
    const importantDatesData =
      await ImportantDatesController.getCurrentImportantDatesData(
        req.params.conference_id
      ); // Assure-toi que tu passes un ID valide pour la conférence si nécessaire
    const topicsData = await TopicController.getTopicData(
      req.params.conference_id
    ); // Assure-toi de la bonne utilisation de l'ID

    res.status(200).json({
      conferenceData,
      importantDatesData,
      topicsData,
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get("/public-data", getCurrentConference, async (req, res) => {
  const { conference_id } = req.params;

  try {
    const conferenceData =
      await ConferenceController.getCurrentConferenceData();
    const importantDatesData =
      await ImportantDatesController.getCurrentImportantDatesData(
        conference_id
      );
    const newsData = await NewsController.getNewsByTimeStampData();

    const sponsors = await Sponsor.findAll({ where: { conference_id } });
    const contacts = await Contact.findAll({ where: { conference_id } });

    res.status(200).json({
      conferenceData,
      importantDatesData,
      newsData,
      sponsors,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching public data:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get("/get-everything-by-conference/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conferenceData = await ConferenceController.getConferenceByIdData(id);
    if (!conferenceData) {
      res.status(404).json({
        error: "No conference found",
      });
    }
    const paymentOptions = await PaymentOption.findAll({
      where: { conference_id: id },
    });
    const articlesData = await ArticleController.findArticlesByConferenceData(
      id
    );
    const committeeData = await CommitteeController.getCurrentCommitteesData(
      id
    );
    const registrationFeeData =
      await RegistrationFeeController.getCurrentRegistrationFeesWithCategoriesData(
        id
      );
    const additionalFees =
      await AdditionalFeeController.getAdditionalFeeByConferenceData(id);
    const importantDatesData =
      await ImportantDatesController.getCurrentImportantDatesData(id);
    const newsData = await NewsController.getNewsByConference(id);
    const sponsorsData = await SponsorController.getSponsorsByConferenceData(
      id
    );
    const topicsData = await TopicController.getTopicData(id);

    const plenarySessions = await PlenarySessionController.getByConferenceData(
      id
    );
    const specialSessions = await SpecialSessionController.getByConferenceData(
      id
    );
    const workshops = await WorkshopController.getByConferenceData(id);

    const localInformations =
      await LocalInformationController.getByConferenceData(id);

    const formattedTopics = topicsData.map((topic) => ({
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      content: topic.contents.map((c) => c.text),
    }));

    const contacts = await Contact.findAll({ where: { conference_id: id } });

    res.status(200).json({
      conference: conferenceData,
      articles: articlesData,
      committees: committeeData,
      registrationFees: registrationFeeData,
      additionalFees: additionalFees,
      importantDates: importantDatesData,
      news: newsData,
      sponsors: sponsorsData,
      topics: formattedTopics,
      plenarySessions: plenarySessions,
      specialSessions: specialSessions,
      workshops: workshops,
      localInformations: localInformations,
      paymentOptions: paymentOptions,
      contacts: contacts,
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get(
  "/registration-fees/current",
  getCurrentConference,
  async (req, res) => {
    const { conference_id } = req.params;
    console.log("✅ Good route toggled");
    try {
      const fees =
        await RegistrationFeeController.getCurrentRegistrationFeesWithCategoriesData(
          conference_id
        );
      const dates = await ImportantDatesController.getCurrentImportantDatesData(
        conference_id
      );
      const additionalFees =
        await AdditionalFeeController.getAdditionalFeeByConferenceData(
          conference_id
        );
      const options = await PaymentOption.findAll({ where: { conference_id } });
      const conference = await Conference.findByPk(conference_id, {
        attributes: ["registrations_open"],
      });

      const registrations_open = conference?.registrations_open;

      res.status(200).json({
        additionalFees,
        importantDates: dates,
        registrationFees: fees,
        paymentOptions: options,
        registrations_open,
      });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

router.get("/submission", getCurrentConference, async (req, res) => {
  try {
    const { conference_id } = req.params;
    const fees = await AdditionalFeeController.getAdditionalFeeByConferenceData(
      conference_id
    );
    const dates = await ImportantDatesController.getCurrentImportantDatesData(
      conference_id
    );

    return res.status(200).json({
      fees,
      dates,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/program", getCurrentConference, async (req, res) => {
  try {
    const { conference_id } = req.params;
    const plenarySessions = await PlenarySessionController.getByConferenceData(
      conference_id
    );
    const specialSessions = await SpecialSessionController.getByConferenceData(
      conference_id
    );
    const workshops = await WorkshopController.getByConferenceData(
      conference_id
    );

    return res.status(200).json({
      plenarySessions,
      specialSessions,
      workshops,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post(
  "/payment",
  verifyPaymentInformations,
  handleValidationErrors,
  getCurrentConference,
  async (req, res) => {
    const { conference_id } = req.params;
    const {
      articles,
      country,
      email,
      id,
      options,
      name,
      surname,
      feeType,
      feeProfile,
    } = req.body;
    try {
      if (
        articles.length > 1 &&
        (feeType.toLowerCase() === "student" ||
          feeType.toLowerCase() === "students")
      ) {
        return res
          .status(401)
          .json({ error: "You can't submit more than 1 paper as a student." });
      }
      const conference = await Conference.findByPk(conference_id, {
        attributes: ["registrations_open"],
      });
      if (!conference?.registrations_open) {
        return res
          .status(401)
          .json({ error: "Registrations are not opened yet." });
      }
      let articleIds = [];
      let optionIds = [];

      if (articles) {
        articleIds = articles.map((article) => article.id);
      }

      if (options) {
        optionIds = options.map((option) => option.id);
      }

      const existingArticles = await Article.findAll({
        where: {
          id: {
            [Op.in]: articleIds,
          },
        },
        include: {
          model: Author,
          as: "authors",
          attributes: ["id"],
        },
      });

      const areArticlesRegistered = existingArticles.find(
        (article) => article?.registration_id !== null
      );

      const existingOptions = await PaymentOption.findAll({
        where: {
          id: {
            [Op.in]: optionIds,
          },
        },
      });

      if (existingArticles.length !== articleIds.length) {
        return res.status(400).json({
          error: "Some articles couldn't be find.",
          missingIds: articleIds.filter(
            (id) => !existingArticles.find((article) => article.id === id)
          ),
        });
      }

      if (areArticlesRegistered) {
        return res.status(401).json({
          error: `Article ${areArticlesRegistered?.title} has already been registered.`,
        });
      }

      const unauthorizedArticles = id
        ? existingArticles.filter(
            (article) => !article.authors.some((author) => author.id === id)
          )
        : [];

      if (unauthorizedArticles.length > 0) {
        return res.status(401).json({
          error: "An article of your selection doesn't belong to you.",
          articles: unauthorizedArticles.map((a) => a.id),
        });
      }

      const verifyStatus = existingArticles.find(
        (article) => article.status !== "accepted"
      );

      if (verifyStatus) {
        return res.status(401).json({
          error: "An article of your selection is not accepted by the jury.",
          article: verifyStatus,
        });
      }

      const articlesIdsWithExtraPages = existingArticles.map((article) => {
        const corrArt = articles.find(
          (sentArticle) => sentArticle.id === article.id
        );
        return { id: article.id, extraPages: corrArt.extraPages };
      });

      let registrationFees = await RegistrationFee.findOne({
        where: { description: { [Op.like]: country.name } },
        include: { model: FeeCategory, as: "feecategories" },
      });

      if (!registrationFees) {
        registrationFees = await RegistrationFee.findOne({
          where: { description: "Other Countries" },
          include: {
            model: FeeCategory,
            as: "feecategories",
          },
        });
      }

      const category = registrationFees.feecategories.find(
        (category) => category.type.toLowerCase() === feeType.toLowerCase()
      );

      if (!category) {
        return res.status(400).json({
          error: `No registration category found for ${feeType} in country ${country.name}.`,
        });
      }
      const baseFee = parseFloat(category[feeProfile]);

      if (!baseFee) {
        return res
          .status(400)
          .json({ error: "You have to select valid options." });
      }

      const additionnalFees = await AdditionalFee.findOne({
        where: { conference_id },
      });

      const totalExtraPages =
        articles?.reduce(
          (sum, article) => sum + (Number(article.extraPages) || 0),
          0
        ) || 0;

      const totalOptionsPrice =
        existingOptions?.reduce(
          (sum, option) => sum + (Number(option.price) || 0),
          0
        ) || 0;

      const extraArticles = Math.max(
        0,
        (articles?.length || 0) -
          additionnalFees.given_articles_per_registration
      );

      const totalFees = {
        baseFee,
        additionalArticlesFee:
          extraArticles * additionnalFees.additional_paper_fee,
        additionalArticles: extraArticles,
        additionalPagesFee:
          totalExtraPages * Number(additionnalFees.additional_page_fee),
        additionalPages: totalExtraPages,
        totalOptionsFee: totalOptionsPrice,
        total: 0,
      };
      totalFees.total =
        baseFee +
        totalFees.additionalArticlesFee +
        totalFees.additionalPagesFee +
        totalFees.totalOptionsFee;

      if (totalFees.total === 0) {
        return res.status(400).json({
          error:
            "Total fee is zero. Free registrations must be handled manually, send a message to the support to complete your registration.",
        });
      }

      const stripeMetadata = {
        email,
        conference_id,
        articles: JSON.stringify(articlesIdsWithExtraPages),
        options_ids: JSON.stringify(optionIds),
        extraPages: totalExtraPages,
        name,
        surname,
        country: JSON.stringify(country),
        type: feeType,
        profile: feeProfile,
        amount: Math.round(totalFees.total * 100),
      };

      console.log("📤 Data sent to stripe :", stripeMetadata);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeMetadata.amount,
        currency: "eur",
        payment_method_types: ["card"],
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic",
          },
        },
        metadata: stripeMetadata,
      });

      return res.status(200).json({
        totalFees,
        email,
        id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
