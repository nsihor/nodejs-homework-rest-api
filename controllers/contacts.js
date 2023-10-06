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

const getContactById = async (contactId, owner) => {
  const contact = await Contact.find({ _id: contactId, owner });

  if (!contact) return null;

  return contact;
};

const removeContact = async (contactId, owner) => {
  const contact = await Contact.find({ _id: contactId, owner });

  if (contact.length === 0) return null;

  await Contact.findOneAndDelete({ _id: contactId, owner });

  return { message: "Contact deleted" };
};

const addContact = async (body, owner) => {
  const newContact = new Contact({ ...body, owner });
  const savedContact = await newContact.save();

  return savedContact;
};

const updateContact = async (contactId, body, owner) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    body,
    {
      new: true,
    }
  );
  console.log("updatedContact:", updatedContact);

  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
