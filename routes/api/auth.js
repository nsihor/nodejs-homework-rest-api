const express = require("express");
const HttpError = require("../../helpers/HttpError");
const authorization = require("../../middlewares/authorization");
const upload = require("../../middlewares/upload");
const {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
} = require("../../controllers/auth");
const {
  userJoiSchema,
  updateSubscriptionJoiSchema,
  emailJoiSchema,
} = require("../../models/user");

const router = express.Router("api/users");

router.post("/register", async (req, res, next) => {
  try {
    const { error } = userJoiSchema.validate(req.body);

    if (error) return next(HttpError(400));

    const newContact = await register(req.body);

    if (newContact.message === "Email in use")
      return next(HttpError(409, newContact.message));

    res.status(201).json(newContact);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const verify = await verifyEmail(req.params.verificationToken);

    if (verify === "User not found") {
      return next(HttpError(404, verify.message));
    }

    res.json(verify);
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = emailJoiSchema.validate(req.body);
    if (error) {
      return next(HttpError(400, "missing required field email"));
    }

    const verify = await resendVerifyEmail(req.body.email);

    if (!verify) {
      return next();
    }

    if (verify.message === "Verification has already been passed") {
      return next(HttpError(400, verify.message));
    }

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authorization, async (req, res, next) => {
  try {
    const { id } = req.user;

    await logout(id);

    res.status(204).json({ message: "No Content" });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = userJoiSchema.validate(req.body);

    if (error) return next(HttpError(400));

    const user = await login(req.body);

    if (!user || !user.token)
      return next(HttpError(401, "Email or password is wrong"));

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/current", authorization, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    const user = await getCurrent({ email, subscription });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/", authorization, async (req, res, next) => {
  try {
    const { error } = updateSubscriptionJoiSchema.validate(req.body);

    if (error) return next(HttpError(400));

    const { id } = req.user;

    const newSubscription = req.body.subscription;

    await updateSubscription(id, newSubscription);

    res.json({ message: `subscription updated to ${newSubscription}` });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  authorization,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      console.log("req.file:", req.file);

      const avatarUrl = await updateAvatar(req.user.id, req.file);

      res.json({ avatarUrl });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;
