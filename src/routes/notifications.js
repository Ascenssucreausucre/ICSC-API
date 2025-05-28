const express = require("express");
const router = express.Router();
const { PushSubscription } = require("../models");
const webpush = require("../utils/webPush");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

router.post("/subscribe", async (req, res) => {
  const { endpoint, expirationTime, keys } = req.body;
  const { id } = req.user;

  try {
    await PushSubscription.upsert({
      endpoint,
      expirationTime,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: id,
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

// router.get("/notify-all", async (req, res) => {
//   let allSubs;
//   try {
//     allSubs = await PushSubscription.findAll();
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Erreur récupération souscriptions." });
//   }

//   const payload = JSON.stringify({
//     title: "Nouvelle actu !",
//     body: "Ceci est un envoi groupé.",
//     url: "/",
//   });

//   const results = await Promise.allSettled(
//     allSubs.map(async (sub) => {
//       try {
//         await webpush.sendNotification(
//           {
//             endpoint: sub.endpoint,
//             expirationTime: sub.expirationTime,
//             keys: {
//               p256dh: sub.p256dh,
//               auth: sub.auth,
//             },
//           },
//           payload
//         );
//         return { endpoint: sub.endpoint, status: "sent" };
//       } catch (err) {
//         if (err.statusCode === 410 || err.statusCode === 404) {
//           await PushSubscription.destroy({ where: { endpoint: sub.endpoint } });
//         }
//         return {
//           endpoint: sub.endpoint,
//           status: "error",
//           message: err.message,
//         };
//       }
//     })
//   );

//   res.json({ message: "Notifications traitées", results });
// });

router.post("/notify-all", authenticateAdmin, async (req, res) => {
  const {
    title,
    content,
    icon,
    badge,
    image,
    vibrate,
    tag,
    renotify,
    actions,
    data,
    url = "/",
  } = req.body;

  let allSubs;
  try {
    allSubs = await PushSubscription.findAll();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erreur récupération souscriptions." });
  }

  // Préparer le payload complet à envoyer au service worker
  const payload = JSON.stringify({
    title,
    body: content,
    icon,
    badge,
    image,
    vibrate,
    tag,
    renotify,
    actions,
    data,
    url,
  });

  const results = await Promise.allSettled(
    allSubs.map(async (sub) => {
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
        return { endpoint: sub.endpoint, status: "sent" };
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.destroy({ where: { endpoint: sub.endpoint } });
        }
        return {
          endpoint: sub.endpoint,
          status: "error",
          message: err.message,
        };
      }
    })
  );

  res
    .status(200)
    .json({ message: "Notifications successfully sent!", results });
});

module.exports = router;
