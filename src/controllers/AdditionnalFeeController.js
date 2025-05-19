const { AdditionnalFee } = require("../models");

exports.addAdditionnalFee = async (req, res) => {
  try {
    const { additionnal_paper_fee, additionnal_page_fee, conference_id } =
      req.body;
    const additionnalFee = await AdditionnalFee.create({
      additionnal_paper_fee,
      additionnal_page_fee,
      conference_id,
    });
    res.status(201).json({
      message:
        "Additionnal fee sucessfully added to conference " + conference_id,
      newItem: additionnalFee,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error " + error,
    });
  }
};

exports.getAdditionnalFeeByConferenceData = async (conference_id) => {
  return await AdditionnalFee.findOne({
    where: { conference_id },
  });
};

exports.getAdditionnalFeeByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const additionnalFee = await exports.getAdditionnalFeeByConferenceData(
      conference_id
    );
    res.status(200).json(additionnalFee);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};

exports.updateAdditionnalFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionnal_page_fee, additionnal_paper_fee } = req.body;
    const additionnalFee = await AdditionnalFee.findOne({
      where: { id },
    });
    if (!additionnalFee) {
      res.status(404).json({
        error: "No additionnal fee found for this conference",
      });
    }
    await additionnalFee.update({
      additionnal_page_fee,
      additionnal_paper_fee,
    });
    res.status(200).json({
      message: "Additionnal fees successfully updated !",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};
exports.deleteAdditionnalFee = async (req, res) => {
  try {
    const { id } = req.params;
    const additionnalFee = await AdditionnalFee.findOne({
      where: { id },
    });
    if (!additionnalFee) {
      return res.status(404).json({
        error: "No additionnal fee found for this conference",
      });
    }
    await additionnalFee.destroy();
    return res.status(200).json({
      message: "Additionnal fee successfully deleted",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Internal server error " + error,
    });
  }
};
