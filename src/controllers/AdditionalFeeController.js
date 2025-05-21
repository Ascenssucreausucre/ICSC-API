const { AdditionalFee } = require("../models");

exports.addAdditionalFee = async (req, res) => {
  try {
    const {
      additional_paper_fee,
      additional_page_fee,
      max_articles,
      given_articles_per_registration,
      conference_id,
    } = req.body;
    const additionalFee = await AdditionalFee.create({
      additional_paper_fee,
      additional_page_fee,
      max_articles,
      given_articles_per_registration,
      conference_id,
    });
    res.status(201).json({
      message:
        "Additional fee sucessfully added to conference " + conference_id,
      newItem: additionalFee,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error " + error,
    });
  }
};

exports.getAdditionalFeeByConferenceData = async (conference_id) => {
  return await AdditionalFee.findOne({
    where: { conference_id },
  });
};

exports.getAdditionalFeeByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const additionalFee = await exports.getAdditionalFeeByConferenceData(
      conference_id
    );
    res.status(200).json(additionalFee);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};

exports.updateAdditionalFee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      additional_page_fee,
      additional_paper_fee,
      max_articles,
      given_articles_per_registration,
    } = req.body;
    const additionalFee = await AdditionalFee.findOne({
      where: { id },
    });
    if (!additionalFee) {
      res.status(404).json({
        error: "No additional fee found for this conference",
      });
    }
    await additionalFee.update({
      additional_page_fee,
      additional_paper_fee,
    });
    res.status(200).json({
      message: "Additional fees successfully updated !",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};
exports.deleteAdditionalFee = async (req, res) => {
  try {
    const { id } = req.params;
    const additionalFee = await AdditionalFee.findOne({
      where: { id },
    });
    if (!additionalFee) {
      return res.status(404).json({
        error: "No additional fee found for this conference",
      });
    }
    await additionalFee.destroy();
    return res.status(200).json({
      message: "Additional fee successfully deleted",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};
