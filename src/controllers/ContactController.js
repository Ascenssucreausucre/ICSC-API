const { Conference, Contact } = require("../models");

exports.create = async (req, res) => {
  const { email, tel, name, surname, role, conference_id } = req.body;

  try {
    const contact = await Contact.create({
      email,
      tel,
      name,
      surname,
      role,
      conference_id,
    });
    res.status(201).json({
      message: `Successfully create contact ${name} ${surname}.`,
      newitem: contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.getAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      res.status(404).json({ error: `No contact found with id: ${id}` });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.getByConference = async (req, res) => {
  const { conference_id } = req.params;
  try {
    const contacts = await Contact.findAll({ where: { conference_id } });
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.update = async (req, res) => {
  const { email, tel, name, surname, role, id } = req.body;
  try {
    const contact = await Contact.findByPk(id);
    if (contact) {
      res.status(404).json({ error: `No contact found with id: ${id}` });
    }
    await contact.update({ email, tel, name, surname, name, role });
    res.status(200).json({ message: "Contact successfully updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.delete({ where: { id } });
    if (deletedContact.length === 0) {
      return res.status(404).json({ error: `No contact found with id ${id}` });
    }
    res.status.json({
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
