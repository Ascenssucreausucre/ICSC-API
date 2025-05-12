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
    const { type, conference_id } = req.body;
    if (!conference_id || typeof conference_id !== "number") {
      return res.status(400).json({
        error: "Conference id is either absent or wrongly formatted.",
      });
    }
    if (typeof type !== "string" || type === "") {
      return res.status(400).json({
        error: "Either empty type or wrongly formatted.",
      });
    }
    const newCommittee = await Committee.create({ type, conference_id });
    res.status(201).json({
      message: `Committee ${newCommittee.type} successfully created.`,
      newItem: newCommittee,
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
    res.status(error.statusCode || 500).json({ error: error.message });
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
        error: `No committee found with ID: ${id}.`,
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
        error: `No committee found with ID: ${id}.`,
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
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.addMemberToCommittee = async (req, res) => {
  try {
    const { committee_id, id, name, surname, affiliation, title } = req.body;

    // Vérifier ou créer le membre
    let member = await CommitteeMember.findByPk(id);
    if (!member) {
      member = await CommitteeMember.create({ name, surname, affiliation });
    }

    // Vérifier l'existence du comité
    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    // Ajouter le membre au comité avec le rôle
    await committee.addMember(member, { through: { title } });

    res
      .status(200)
      .json({ message: "Member added to committee successfully." });
  } catch (error) {
    console.error("Error adding member to committee:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addMembersToCommittee = async (req, res) => {
  try {
    const { committee_id, members } = req.body; // `members` est un tableau [{ member_id, name, surname, affiliation, title }]

    // Vérifier l'existence du comité
    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    // Traiter chaque membre individuellement
    const membersToAdd = await Promise.all(
      members.map(async ({ id, name, surname, affiliation, title }) => {
        let member = await CommitteeMember.findByPk(id);
        if (!member) {
          member = await CommitteeMember.create({ name, surname, affiliation });
        }
        return { member, title };
      })
    );

    // Ajouter tous les membres avec leurs rôles
    await Promise.all(
      membersToAdd.map(({ member, title }) =>
        committee.addMember(member, { through: { title } })
      )
    );

    res.status(200).json({
      message: `${members.length} members added to committee successfully.`,
    });
  } catch (error) {
    console.error("Error adding members to committee:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeMemberFromCommittee = async (req, res) => {
  try {
    const { committee_id, member_id } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
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

exports.removeMembersFromCommittee = async (req, res) => {
  try {
    const { committee_id, member_ids } = req.body; // `member_ids` est un tableau d'IDs

    // Vérifier si le comité existe
    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    // Vérifier si tous les membres existent
    const existingMembers = await CommitteeMember.findAll({
      where: { id: member_ids },
    });

    if (existingMembers.length !== member_ids.length) {
      return res.status(404).json({ error: "One or more members not found." });
    }

    // Supprimer tous les membres en une seule opération
    await committee.removeMembers(existingMembers);

    res.status(200).json({
      message: `${member_ids.length} members removed from committee successfully.`,
    });
  } catch (error) {
    console.error("Error removing members from committee:", error);
    res.status(500).json({ error: error.message });
  }
};
