const { Conference } = require("../models"); // Assurez-vous que Conference est bien importé

const getCurrentConference = async (req, res, next) => {
  try {
    const currentConference = await Conference.findOne({
      where: { current: 1 },
    });

    if (!currentConference) {
      return res.status(404).json({ error: "No current conference found" });
    }
    req.params.conference_id = currentConference.id;
    req.body.conference_id = currentConference.id; // Ajoute l'ID de la conférence en cours à la requête
    next(); // Passe au middleware/contrôleur suivant
  } catch (error) {
    console.error("Error retrieving current conference:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = getCurrentConference;
