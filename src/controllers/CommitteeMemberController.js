const sequelize = require("../config/sequelize");
const { CommitteeMember, Committee, CommitteeRole } = require("../models");
const { Op, where } = require("sequelize");

exports.getMemberByIdData = async (id) => {
  return await CommitteeMember.findOne({
    where: { id },
    include: [
      {
        model: Committee,
        as: "committees",
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

exports.getExistingCommitteeMembers = async (req, res) => {
  try {
    const committeeMembersList = await CommitteeMember.findAll();

    if (committeeMembersList.length === 0)
      res.status(404).json({
        error: "No committee member found",
      });
    res.status(200).json(committeeMembersList);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await exports.getMemberByIdData(id);

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getMembersByCommittee = async (req, res) => {
  try {
    const { committee_id } = req.params;
    const members = await exports.getMembersByCommitteeData(committee_id);

    if (!members) {
      return res.status(404).json({ error: "Committee not found." });
    }

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members by committee:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCommitteeMember = async (req, res) => {
  try {
    const newMember = await CommitteeMember.create(req.body);
    res.status(201).json({
      message: `Committee member ${newMember.name} successfully created.`,
      newItem: newMember,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCommitteeMembers = async (req, res) => {
  try {
    const newMembers = await CommitteeMember.bulkCreate(req.body);
    res.status(201).json({
      message: `${newMembers.length} committee members successfully created.`,
      newItem: newMembers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { committee_id, member_id, title } = req.body;

    const memberCommittee = await CommitteeRole.findOne({
      where: { committee_id: committee_id, member_id: member_id },
    });

    if (!memberCommittee) {
      return res.status(404).json({ error: "Member not found in committee." });
    }

    // Mettre à jour le rôle
    memberCommittee.title = title;
    await memberCommittee.save();

    res.status(200).json({ message: "Member role updated successfully." });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMemberRoles = async (req, res) => {
  try {
    const { committee_id, roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Invalid roles data." });
    }

    const memberCommittees = await CommitteeRole.findAll({
      where: {
        committee_id: committee_id,
        member_id: roles.map((role) => role.member_id),
      },
    });

    if (memberCommittees.length === 0) {
      return res.status(404).json({ error: "No members found in committee." });
    }

    await Promise.all(
      memberCommittees.map((memberCommittee) => {
        const newRole = roles.find(
          (r) => r.member_id === memberCommittee.member_id
        );
        if (newRole) {
          memberCommittee.title = newRole.title || "";
          return memberCommittee.save();
        }
      })
    );

    res.status(200).json({ message: "Member roles updated successfully." });
  } catch (error) {
    console.error("Error updating member roles:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addRoleToMember = async (req, res) => {
  try {
    const { committee_id, member_id, title } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    await committee.addMember(member, { through: { title } });

    res.status(200).json({ message: "Role added to member successfully." });
  } catch (error) {
    console.error("Error adding role to member:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeRoleFromMember = async (req, res) => {
  try {
    const { committee_id, member_id, title } = req.body;

    const committee = await Committee.findByPk(committee_id);
    if (!committee) {
      return res.status(404).json({ error: "Committee not found." });
    }

    const member = await CommitteeMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
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

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberToDelete = await CommitteeMember.destroy({
      where: { id },
    });

    if (memberToDelete === 0) {
      return res.status(404).json({
        error: "No member found",
      });
    }

    res.status(200).json({
      message: "Member successfully deleted.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, affiliation } = req.body;

    const member = await CommitteeMember.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    if (name !== undefined) member.name = name;
    if (surname !== undefined) member.surname = surname;
    if (affiliation !== undefined) member.affiliation = affiliation;

    await member.save();

    res.status(200).json({ message: "Member updated successfully.", member });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateMembers = async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Invalid members data." });
    }

    const memberIds = members.map((m) => m.id);
    const existingMembers = await CommitteeMember.findAll({
      where: { id: memberIds },
    });

    if (existingMembers.length !== members.length) {
      return res.status(404).json({ error: "One or more members not found." });
    }

    await Promise.all(
      existingMembers.map((member) => {
        const updatedData = members.find((m) => m.id === member.id);
        if (updatedData) {
          member.name =
            updatedData.name !== undefined ? updatedData.name : member.name;
          member.surname =
            updatedData.surname !== undefined
              ? updatedData.surname
              : member.surname;
          member.affiliation =
            updatedData.affiliation !== undefined
              ? updatedData.affiliation
              : member.affiliation;

          return member.save();
        }
      })
    );

    res.status(200).json({ message: "Members updated successfully." });
  } catch (error) {
    console.error("Error updating members:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.clearMembers = async (req, res) => {
  try {
    const membersToClear = await CommitteeMember.findAll({
      include: [
        {
          model: Committee,
          as: "committees",
          required: false,
          through: {
            attributes: [],
          },
        },
      ],
      where: {
        "$committees.id$": null,
      },
    });
    if (!membersToClear) {
      res.status(404).json({
        error: "No members without committee found.",
      });
    }
    await CommitteeMember.destroy({
      where: {
        id: {
          [Op.in]: membersToClear.map((m) => m.id),
        },
      },
    });
  } catch (error) {
    console.error("Error deleting members:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getMembersToClear = async (req, res) => {
  try {
    const membersToClear = await CommitteeMember.findAll({
      include: [
        {
          model: Committee,
          as: "committees",
          required: false,
          through: {
            attributes: [],
          },
        },
      ],
      where: {
        "$committees.id$": null,
      },
    });

    if (membersToClear.length === 0) {
      return res.status(404).json({
        error: "No members without committee found.",
      });
    }

    res.status(200).json(membersToClear);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: error.message });
  }
};
