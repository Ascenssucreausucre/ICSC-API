const { PaymentOption } = require("../models");

exports.create = async (req, res) => {
  const { name, price, conference_id } = req.body;

  try {
    const option = await PaymentOption.create({ name, price, conference_id });
    return res.status(201).json({
      message: "Option successfully created!",
      newItem: option,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  const { name, price, description } = req.body;
  const { id } = req.params;
  try {
    const option = await PaymentOption.findByPk(id);
    if (!option) {
      return res.status(404).json({ error: `No option found with id ${id}` });
    }
    await option.update({ name, price, description });
    res.status(200).json({ message: "Option successfully updated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOption = await PaymentOption.delete({ where: { id } });
    if (deletedOption.length === 0) {
      return res
        .status(404)
        .json({ error: `No payment option found with id ${id}` });
    }
    return res
      .status(200)
      .json({ message: "Payment option successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAll = async (req, res) => {
  const paymentOptions = await PaymentOption.findAll();
  res.status(200).json(paymentOptions);
};
exports.getByConference = async (req, res) => {
  const { conference_id } = req.params;
  const paymentOptions = await PaymentOption.findAll({
    where: { conference_id },
  });
  res.status(200).json(paymentOptions);
};
exports.getById = async (req, res) => {
  const { id } = req.params;
  const paymentOptions = await PaymentOption.findByPk(id);
  res.status(200).json(paymentOptions);
};
