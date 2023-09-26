const Contact = require("../models/contact");

const listContacts = async () => Contact.find();

const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);

  if (!contact) return null;

  return contact;
};

const removeContact = async (contactId) => {
  const contact = await Contact.findById(contactId);

  if (!contact) return null;

  await Contact.deleteOne({ _id: contactId });

  return { message: "Contact deleted" };
};

const addContact = async (body) => {
  const newContact = new Contact(body);
  const savedContact = await newContact.save();

  return savedContact;
};

const updateContact = async (contactId, body) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });

  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
