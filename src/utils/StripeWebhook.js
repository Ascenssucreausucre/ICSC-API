require("dotenv").config();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
const { Registration, Article, sequelize } = require("../models");
const { Op } = require("sequelize");

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("✅ Payment successful for", paymentIntent.id);

    const {
      email,
      conference_id,
      articles,
      options_ids,
      name,
      surname,
      country,
      amount,
      type,
      profile,
      extraPages,
    } = paymentIntent.metadata;
    console.log("📥 Data received by stripe:", paymentIntent.metadata);

    const parsedArticles = JSON.parse(articles);
    const optionIds = JSON.parse(options_ids);
    const parsedCountry = JSON.parse(country);
    const parsedAmount = parseInt(amount, 10);

    const transaction = await sequelize.transaction();
    try {
      console.log("👉 Creating registration...");
      const registration = await Registration.create(
        {
          email,
          conference_id,
          name,
          surname,
          country: parsedCountry.name,
          type,
          profile,
          amount_paid: parsedAmount / 100,
          extraPages: extraPages || 0,
        },
        { transaction }
      );

      console.log("👉 Updating articles...");
      const articleUpdatePromises = (
        Array.isArray(parsedArticles) ? parsedArticles : []
      ).map((article) => {
        if (!article?.id) return Promise.resolve(); // skip if no ID
        return Article.update(
          {
            registration_id: registration.id,
            extraPages: Number(article.extraPages) || 0,
          },
          {
            where: { id: article.id },
            transaction,
          }
        );
      });

      await Promise.all(articleUpdatePromises);

      console.log("👉 Adding options...");
      await registration.addOptions(optionIds, { transaction });

      await transaction.commit();
      console.log("✅ Transaction complete");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Registration failed:", error.message);
      return res.status(500).json({ received: false });
    }
  }

  res.status(200).json({ received: true });
};
module.exports = stripeWebhook;
