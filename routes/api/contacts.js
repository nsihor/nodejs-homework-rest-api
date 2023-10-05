const express = require("express");
const authorization = require("../../middlewares/authorization");
const HttpError = require("../../helpers/HttpError");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../controllers/contacts");
const {
  addSchema,
  putSchema,
  changeFavoriteSchema,
} = require("../../models/contact");

const router = express.Router("api/contacts");

router.get("/", authorization, async (req, res, next) => {
  try {
    const { page = 1, limit = 2, favorite } = req.query;

    const contacts = await listContacts(req.user.id, page, limit, favorite);

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", authorization, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);

    if (!contact) {
      next();
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", authorization, async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);

    if (error) return next(HttpError(400, "missing required name field"));

    const contact = await addContact(req.body, req.user.id);

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", authorization, async (req, res, next) => {
  try {
    const deleteMessage = await removeContact(req.params.contactId);

    if (!deleteMessage) {
      next();
    }

    res.status(200).json(deleteMessage);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", authorization, async (req, res, next) => {
  try {
    const { error } = putSchema.validate(req.body);

    if (error) return next(HttpError(400, "missing fields"));

    const contact = await updateContact(req.params.contactId, req.body);

    if (!contact) return next();

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", authorization, async (req, res, next) => {
  try {
    const { error } = changeFavoriteSchema.validate(req.body);

    if (error) return next(HttpError(400, "missing field favorite"));

    const contact = await updateContact(req.params.contactId, req.body);

    if (!contact) return next();

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
