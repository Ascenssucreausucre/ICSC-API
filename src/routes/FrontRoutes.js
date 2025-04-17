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

router.get("/navbar-data", getCurrentConference, async (req, res) => {
  try {
    const conferenceData =
      await ConferenceController.getCurrentConferenceData();
    const importantDatesData =
      await ImportantDatesController.getCurrentImportantDatesData(
        req.params.conference_id
      ); // Assure-toi que tu passes un ID valide pour la conférence si nécessaire
    const newsData = await NewsController.getNewsByTimeStampData();

    res.status(200).json({
      conferenceData,
      importantDatesData,
      newsData,
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});
router.get(
  "/footer-data",
  getCurrentConference,
  SponsorController.getSponsorsByConference
);

router.get("/get-everything-by-conference/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conferenceData = await ConferenceController.getConferenceByIdData(id);
    if (!conferenceData) {
      res.status(404).json({
        error: "No conference found",
      });
    }
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
    const importantDatesData =
      await ImportantDatesController.getCurrentImportantDatesData(id);
    const newsData = await NewsController.getNewsByConference(id);
    const sponsorsData = await SponsorController.getSponsorsByConferenceData(
      id
    );
    const topicsData = await TopicController.getTopicData(id);

    const formattedTopics = topicsData.map((topic) => ({
      id: topic.id,
      conference_id: topic.conference_id,
      title: topic.title,
      content: topic.contents.map((c) => c.text),
    }));

    res.status(200).json({
      conference: conferenceData,
      articles: articlesData,
      committees: committeeData,
      registrationFees: registrationFeeData,
      importantDates: importantDatesData,
      news: newsData,
      sponsors: sponsorsData,
      topics: formattedTopics,
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
    try {
      const fees =
        await RegistrationFeeController.getCurrentRegistrationFeesWithCategoriesData(
          req.params.conference_id
        );
      const dates = await ImportantDatesController.getCurrentImportantDatesData(
        req.params.conference_id
      );
      res.status(200).json({
        importantDates: dates,
        registrationFees: fees,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

module.exports = router;
