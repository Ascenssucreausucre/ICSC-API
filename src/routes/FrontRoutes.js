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
const AdditionnalFeeController = require("../controllers/AdditionnalFeeController");
const PlenarySessionController = require("../controllers/PlenarySessionController");
const SpecialSessionController = require("../controllers/SpecialSessionController");
const WorkshopController = require("../controllers/WorkshopController");
const LocalInformationController = require("../controllers/LocalInformationController");

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
    const additionnalFees =
      await AdditionnalFeeController.getAdditionnalFeeByConferenceData(id);
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

    res.status(200).json({
      conference: conferenceData,
      articles: articlesData,
      committees: committeeData,
      registrationFees: registrationFeeData,
      additionnalFees: additionnalFees,
      importantDates: importantDatesData,
      news: newsData,
      sponsors: sponsorsData,
      topics: formattedTopics,
      plenarySessions: plenarySessions,
      specialSessions: specialSessions,
      workshops: workshops,
      localInformations: localInformations,
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
      const additionnalFees =
        await AdditionnalFeeController.getAdditionnalFeeByConferenceData(
          req.params.conference_id
        );
      res.status(200).json({
        additionnalFees,
        importantDates: dates,
        registrationFees: fees,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

router.get("/submission", getCurrentConference, async (req, res) => {
  try {
    const { conference_id } = req.params;
    const fees =
      await AdditionnalFeeController.getAdditionnalFeeByConferenceData(
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

module.exports = router;
