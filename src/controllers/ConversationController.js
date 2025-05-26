const { Message, Conversation, User } = require("../models");

exports.sendMessage = async (req, res) => {
  const io = req.app.get("io");
  const { conversationId } = req.params;
  const { content } = req.body;
  const { id: senderId, role: senderType } = req.user;

  try {
    let conversation;

    if (senderType === "user") {
      conversation = await Conversation.findOne({
        where: { userId: senderId },
      });

      if (!conversation) {
        conversation = await Conversation.create({ userId: senderId });
      }
    } else if (senderType === "admin") {
      conversation = await Conversation.findByPk(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: "No conversation found." });
      }
    }

    const message = await Message.create({
      content,
      senderType,
      senderId,
      conversationId: conversation.id,
    });

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

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error while sending the message:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.getUserConversation = async (req, res) => {
  const { id: userId } = req.user;

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

    return res.json(conversation);
  } catch (error) {
    console.error("Error while retreiving conversation :", error);
    return res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};
exports.getConversation = async (req, res) => {
  const { id } = req.params;

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

    return res.json(conversation);
  } catch (error) {
    console.error("Error while retreiving conversation :", error);
    return res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

exports.getAllConversationsWithLastMessage = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        archived: false,
      },
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
      order: [["lastMessageAt", "DESC"]],
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Error retreiving conversations :", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.archiveConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    conversation.archived = true;
    await conversation.save();

    return res.status(200).json({ message: "Archiving successful." });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
