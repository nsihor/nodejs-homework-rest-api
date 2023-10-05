const { Contact } = require("../models/contact");

const listContacts = async (owner, page, limit, favorite) => {
  const contactsQuery = { owner };

  if (favorite !== undefined) {
    contactsQuery.favorite = favorite;
  }

  const skip = (page - 1) * limit;

  const totalCount = await Contact.countDocuments(contactsQuery);
  const contacts = await Contact.find(contactsQuery).skip(skip).limit(limit);

  return { totalCount, contacts };
};

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

const addContact = async (body, owner) => {
  const newContact = new Contact({ ...body, owner });
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
