const { CommitteeMember, Committee, CommitteeRole } = require("../models");

// Méthode Data pour récupérer un membre par son ID
exports.getMemberByIdData = async (id) => {
  return await CommitteeMember.findOne({
    where: { id },
    include: [
      {
        model: Committee,
        as: "committee",
        include: [
          {
            model: CommitteeRole,
            through: {
              model: CommitteeRole,
              attributes: ["title"],
            },
          },
        ],
      },
    ],
  });
};

// Méthode Data pour récupérer les membres d'un comité
exports.getMembersByCommitteeData = async (committee_id) => {
  const committee = await Committee.findByPk(committee_id, {
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

  return committee ? committee.members : null;
};

// Endpoint HTTP pour récupérer un membre par son ID
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await exports.getMemberByIdData(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    res.status(500).json({ error: error.message });
  }
};
// Endpoint HTTP pour récupérer les membres d'un comité
exports.getMembersByCommittee = async (req, res) => {
  try {
    const { committee_id } = req.params;
    const members = await exports.getMembersByCommitteeData(committee_id);

    if (!members) {
      return res.status(404).json({ message: "Committee not found." });
    }

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members by committee:", error);
    res.status(500).json({ error: error.message });
  }
};

// Création d'un membre
exports.createCommitteeMember = async (req, res) => {
  try {
    const newMember = await CommitteeMember.create(req.body);
    res.status(201).json({
      message: `Committee member ${newMember.name} successfully created.`,
      id: newMember.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mise à jour du rôle d'un membre
exports.updateMemberRole = async (req, res) => {
  try {
    const { member_id, committee_id, title } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ message: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    const committeeRole = await CommitteeRole.findOne({
      where: { committee_id, member_id },
    });

    if (committeeRole) {
      committeeRole.title = title;
      await committeeRole.save();
    } else {
      await committee.addMember(member, { through: { title } });
    }

    res.status(200).json({ message: "Member role updated successfully." });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: error.message });
  }
};

// Ajout d'un rôle à un membre
exports.addRoleToMember = async (req, res) => {
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

    res.status(200).json({ message: "Role added to member successfully." });
  } catch (error) {
    console.error("Error adding role to member:", error);
    res.status(500).json({ error: error.message });
  }
};

// Suppression d'un rôle d'un membre
exports.removeRoleFromMember = async (req, res) => {
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

    const committeeRole = await CommitteeRole.findOne({
      where: { committee_id, member_id, title },
    });

    if (committeeRole) {
      await committeeRole.destroy();
    }

    res.status(200).json({ message: "Role removed from member successfully." });
  } catch (error) {
    console.error("Error removing role from member:", error);
    res.status(500).json({ error: error.message });
  }
};

// Suppression d'un membre
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberToDelete = await CommitteeMember.destroy({
      where: { id },
    });

    if (memberToDelete === 0) {
      return res.status(404).json({
        message: "No member found",
      });
    }

    res.status(200).json({
      message: "Member successfully deleted.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
