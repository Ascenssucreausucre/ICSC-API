const {
  Committee,
  CommitteeMember,
  CommitteeRole,
  Conference,
} = require("../models");

// Méthode Data pour récupérer les comités actuels
exports.getCurrentCommitteesData = async (conference_id) => {
  return await Committee.findAll({
    where: { conference_id },
    include: [
      {
        model: CommitteeMember,
        as: "members",
        through: {
          model: CommitteeRole,
          attributes: ["title"],
        },
      },
    ],
  });
};

// Endpoint HTTP pour récupérer les comités actuels
exports.getCurrentCommittees = async (req, res) => {
  try {
    const committees = await exports.getCurrentCommitteesData(
      req.params.conference_id
    );
    res.status(200).json(committees);
  } catch (error) {
    console.error("Error fetching current committees:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCommittee = async (req, res) => {
  try {
    const newCommittee = await Committee.create(req.body);
    res.status(201).json({
      message: `Committee ${newCommittee.type} successfully created.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode Data pour récupérer tous les comités
exports.getAllCommitteesData = async () => {
  const committees = await Committee.findAll({
    include: [
      {
        model: CommitteeMember,
        as: "members",
        through: {
          model: CommitteeRole,
          attributes: ["title"],
        },
      },
      {
        model: Conference,
        as: "conference",
        attributes: ["year"],
      },
    ],
  });

  if (committees.length === 0) {
    const error = new Error("No committee found.");
    error.statusCode = 404;
    throw error;
  }

  return committees;
};

// Endpoint HTTP pour récupérer tous les comités
exports.getAllCommittees = async (req, res) => {
  try {
    const committees = await exports.getAllCommitteesData();
    res.status(200).json(committees);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteCommitte = async (req, res) => {
  try {
    const { id } = req.params;

    const committeeToDelete = await Committee.destroy({
      where: { id },
    });

    if (committeeToDelete === 0) {
      return res.status(404).json({
        message: `No committee found with ID: ${id}.`,
      });
    }
    res.status(200).json({
      message: "Committee successfully deleted.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const committeeToUpdate = await Committee.findByPk(id);

    if (!committeeToUpdate) {
      return res.status(404).json({
        message: `No committee found with ID: ${id}.`,
      });
    }

    await committeeToUpdate.update(req.body);

    res.status(200).json({
      message: "Committee successfully updated.",
      committee: committeeToUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode Data pour récupérer un comité par ID
exports.getCommitteeByIdData = async (id) => {
  const committee = await Committee.findOne({
    where: { id },
    include: [
      {
        model: CommitteeMember,
        as: "members",
        through: {
          model: CommitteeRole,
          attributes: ["title"],
        },
      },
      {
        model: Conference,
        as: "conference",
        attributes: ["year"],
      },
    ],
  });

  if (!committee) {
    const error = new Error("Committee not found.");
    error.statusCode = 404;
    throw error;
  }

  return committee;
};

// Endpoint HTTP pour récupérer un comité par ID
exports.getCommitteeById = async (req, res) => {
  try {
    const { id } = req.params;
    const committee = await exports.getCommitteeByIdData(id);
    res.status(200).json(committee);
  } catch (error) {
    console.error("Error fetching committee by ID:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.addMemberToCommittee = async (req, res) => {
  try {
    const { committee_id, member_id, title } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ message: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    await committee.addMember(member, { through: { title } });

    res
      .status(200)
      .json({ message: "Member added to committee successfully." });
  } catch (error) {
    console.error("Error adding member to committee:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeMemberFromCommittee = async (req, res) => {
  try {
    const { committee_id, member_id } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ message: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    await committee.removeMember(member);

    res
      .status(200)
      .json({ message: "Member removed from committee successfully." });
  } catch (error) {
    console.error("Error removing member from committee:", error);
    res.status(500).json({ error: error.message });
  }
};
