const webPush = require("../utils/webPush");
const { Message, Conversation, User, PushSubscriptions } = require("../models");

exports.sendMessage = async (req, res) => {
  const io = req.app.get("io");
  const { id: conversationId } = req.params;
  const { content } = req.body;
  const { id: senderId, role: senderType } = req.user;

  try {
    let conversation;
    let adminType = null;

    if (senderType === "user") {
      conversation = await Conversation.findOne({
        where: { userId: senderId },
        include: {
          model: Message,
          as: "messages",
          attributes: ["senderType", "createdAt"],
        },
        order: [[{ model: Message, as: "messages" }, "createdAt", "DESC"]],
      });

      if (!conversation) {
        conversation = await Conversation.create({ userId: senderId });
      }

      const lastMessage = conversation.messages[0] || null;

      if (
        new Date(conversation.lastMessageAt).getTime() + 60 * 1000 >
          Date.now() &&
        lastMessage &&
        lastMessage.senderType === "user"
      ) {
        return res.status(429).json({
          message: "Please wait at least 1 minute between messages.",
        });
      }
    } else if (senderType === "admin" || senderType === "superadmin") {
      conversation = await Conversation.findByPk(conversationId);

      adminType = "admin";

      if (!conversation) {
        return res
          .status(404)
          .json({ message: "No conversation found with id " + conversationId });
      }
    }

    const message = await Message.create({
      content,
      senderType: adminType ? adminType : senderType,
      senderId,
      conversationId: conversation.id,
    });

    if (message.senderType !== "user") {
      const userId = conversation.userId;

      const userKeys = await PushSubscriptions.findByPk(userId);

      if (userKeys) {
        const payload = {
          title: "New message",
          body: `Admin: ${message.content}`,
          tag: `newMessage_${userId}`,
        };
        try {
          await webPush.sendNotification(
            {
              endpoint: userKeys.endpoint,
              expirationTime: userKeys.expirationTime,
              keys: {
                p256dh: userKeys.p256dh,
                auth: userKeys.auth,
              },
            },
            JSON.stringify(payload)
          );
          return { endpoint: userKeys.endpoint, status: "sent" };
        } catch (error) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.destroy({
              where: { endpoint: userKeys.endpoint },
            });
          }
          return {
            endpoint: userKeys.endpoint,
            status: "error",
            message: err.message,
          };
        }
      }
    }

    conversation.lastMessageAt = new Date();
    conversation.unreadByUser = senderType === "admin";
    conversation.unreadByAdmin = senderType === "user";

    if (conversation.archived) {
      conversation.archived = false;
    }

    await conversation.save();

    io.to(`conversation_${conversation.id}`).emit("newMessage", {
      id: message.id,
      content: message.content,
      senderType: message.senderType,
      senderId: message.senderId,
      createdAt: message.createdAt,
    });

    await conversation.reload({
      include: [
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"],
        },
      ],
    });

    io.to("adminRoom").emit("conversationUpdated", {
      id: conversation.id,
      type: "newMessage",
      data: conversation,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error while sending the message:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.getUserConversation = async (req, res) => {
  const { id: userId } = req.user;
  const io = req.app.get("io");

  try {
    const conversation = await Conversation.findOne({
      where: { userId },
      include: [
        {
          model: Message,
          as: "messages",
        },
      ],
      order: [[{ model: Message, as: "messages" }, "createdAt", "DESC"]],
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    await conversation.update({ unreadByUser: false });

    io.to(`conversation_${conversation.id}`).emit("read", {
      unreadByUser: false,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error while retreiving conversation :", error);
    return res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};
exports.getConversation = async (req, res) => {
  const { id } = req.params;
  const io = req.app.get("io");

  try {
    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: Message,
          as: "messages",
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"], // si tu veux lier les users
        },
      ],
      order: [[{ model: Message, as: "messages" }, "createdAt", "DESC"]],
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    await conversation.update({ unreadByAdmin: false });

    io.to(`conversation_${conversation.id}`).emit("read", {
      unreadByAdmin: false,
    });

    io.to("adminRoom").emit("conversationUpdated", {
      type: "readConversation",
      id: conversation.id,
      data: {
        unreadByAdmin: conversation.unreadByAdmin,
      },
    });

    return res.json(conversation);
  } catch (error) {
    console.error("Error while retreiving conversation :", error);
    return res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

// exports.getAllConversationsWithLastMessage = async (req, res) => {
//   try {
//     const conversations = await Conversation.findAll({
//       // where: {
//       //   archived: false,
//       // },
//       include: [
//         {
//           model: Message,
//           as: "messages",
//           limit: 1,
//           order: [["createdAt", "DESC"]],
//         },
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "surname", "email"],
//         },
//       ],
//       order: [["lastMessageAt", "DESC"]],
//     });

//     return res.status(200).json(conversations);
//   } catch (error) {
//     console.error("Error retreiving conversations :", error);
//     return res.status(500).json({ message: `Server error: ${error.message}` });
//   }
// };

exports.getAdminConversations = async (req, res) => {
  const { showArchived, onlyUnread, limit = 20, page = 1 } = req.query;

  try {
    const whereClause = {};

    // Filtrer par conversations archivées ou non
    if (showArchived === "false") {
      whereClause.archived = false;
    } else if (showArchived === "true") {
      whereClause.archived = true;
    }

    // Pagination
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    // Inclure les messages avec le dernier en haut
    const includeOptions = [
      {
        model: Message,
        as: "messages",
        separate: true,
        limit: 1,
        order: [["createdAt", "DESC"]],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "surname", "email"],
      },
    ];

    // Ajouter un filtre "onlyUnread"
    if (onlyUnread === "true") {
      whereClause.unreadByAdmin = true;
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: includeOptions,
      order: [["lastMessageAt", "DESC"]],
      limit: parsedLimit,
      offset,
    });

    return res
      .status(200)
      .json({ results: conversations, total: conversations.length });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.archiveConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const io = req.app.get("io");
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"],
        },
        {
          model: Message,
          as: "messages",

          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    conversation.archived = !conversation.archived;
    await conversation.save();

    io.to("adminRoom").emit("conversationUpdated", {
      type: "archivedConversation",
      id: conversation.id,
      data: conversation,
    });

    return res.status(200).json({
      message: !conversation.archived
        ? "Conversation successfully restored."
        : "Conversation successfully archived",
    });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
exports.deleteConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const conv = Conversation.findByPk(id);
    if (!conv) {
      return res.status(404).json({
        error: `No conference found with id ${id}`,
      });
    }

    await conv.destroy();

    res.status(200).json({ message: "Conversation successfully deleted." });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
exports.deleteArchivedConversations = async (req, res) => {
  try {
    const deletedCount = await Conversation.destroy({
      where: { archived: true },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "There are no archived conversations." });
    }

    res.status(200).json({
      message: "All archived conversations has been successfully deleted.",
    });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
