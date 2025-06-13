const express = require("express");
const router = express.Router();
const { PushSubscription } = require("../models");
const webpush = require("../utils/webPush");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { authenticateAny } = require("../middleware/authenticateAny");

router.post("/subscribe", authenticateAny, async (req, res) => {
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

    // Sending welcome notification
    const payload = JSON.stringify({
      title: "Welcome ! 🔔",
      body: "You will now receive notifications.",
      url: "/",
    });

    webpush.sendNotification(req.body, payload).catch((err) => {
      console.error("Error while sending the notification :", err.message);
    });

    res.status(201).json({ message: "Subsription saved." });
  } catch (err) {
    console.error("Saving error :", err);
    res.status(500).json(err.message);
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
      .json({ error: "Error while finding subscriptions." });
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

router.get("/status", authenticateAny, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const isUserSubscribed = await PushSubscription.findOne({
      where: { userId },
      attributes: ["id"],
    });

    return res.status(200).json({ subscribed: Boolean(isUserSubscribed) });
  } catch (error) {
    console.error("Error checking push subscription status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
