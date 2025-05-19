const express = require("express");
const router = express.Router();
const { PushSubscription } = require("../models");
const webpush = require("web-push");

router.post("/subscribe", async (req, res) => {
  const { endpoint, expirationTime, keys } = req.body;

  try {
    await PushSubscription.upsert({
      endpoint,
      expirationTime,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    // Envoi notification de bienvenue (non bloquant)
    const payload = JSON.stringify({
      title: "Bienvenue ! 🔔",
      body: "Tu recevras désormais les notifications.",
      url: "/",
    });

    webpush.sendNotification(req.body, payload).catch((err) => {
      console.error("Échec de l'envoi de la notification :", err.message);
    });

    res.status(201).json({ message: "Abonnement enregistré." });
  } catch (err) {
    console.error("Erreur d'enregistrement :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.get("/notify-all", async (req, res) => {
  const allSubs = await PushSubscription.findAll();

  const payload = JSON.stringify({
    title: "Nouvelle actu !",
    body: "Ceci est un envoi groupé.",
    url: "/",
  });

  for (const sub of allSubs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          expirationTime: sub.expirationTime,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
    } catch (err) {
      console.error("Erreur sur", sub.endpoint, err);
    }
  }

  res.json({ message: "Notifications envoyées." });
});

module.exports = router;
