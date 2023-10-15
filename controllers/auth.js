const { User } = require("../models/user");
const sendEmail = require("../helpers/sendEmail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (body) => {
  const { email, password } = body;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return { message: "Email in use" };
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const avatarUrl = gravatar.url(email);

  console.log(nanoid());

  const verificationToken = nanoid();

  const newUser = await User.create({
    ...body,
    password: hashPassword,
    avatarUrl,
    verificationToken,
  });

  const verifyEmailSendOptions = {
    to: email,
    subject: "Verify Email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click for verify</a>`,
  };

  sendEmail(verifyEmailSendOptions);

  return { email: newUser.email, message: "User created" };
};

const verifyEmail = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });

  if (!user) {
    return { message: "User not found" };
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  return { message: "Verification successful" };
};

const resendVerifyEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return null;
  }

  if (user.verify) {
    return { message: "Verification has already been passed" };
  }

  const verifyEmailSendOptions = {
    to: email,
    subject: "Verify Email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click for verify</a>`,
  };

  sendEmail(verifyEmailSendOptions);

  return true;
};

const login = async (body) => {
  const { email, password } = body;

  const user = await User.findOne({ email });

  if (!user || !user.verify) {
    return null;
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return null;
  }

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
  await User.findByIdAndUpdate(user.id, { token });

  return {
    token,
    user: { email: user.email, subscription: user.subscription },
  };
};

const logout = async (id) => User.findByIdAndUpdate(id, { token: "" });

const getCurrent = async (body) => body;

const updateSubscription = async (id, subscription) =>
  User.findByIdAndUpdate(id, { subscription });

const updateAvatar = async (id, file) => {
  const { path: tempUpload, originalname } = file;
  const fileName = `${id}_${originalname}`;

  const resultUpload = path.join(avatarsDir, fileName);
  const avatarUrl = path.join("avatars", fileName);

  const image = await Jimp.read(tempUpload);
  image.resize(250, 250);
  await image.writeAsync(resultUpload);

  await User.findByIdAndUpdate(id, { avatarUrl });

  return avatarUrl;
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};
