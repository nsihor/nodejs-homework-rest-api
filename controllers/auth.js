const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
require("dotenv").config();

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (body) => {
  const { email, password } = body;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return { message: "Email in use" };
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const avatarUrl = gravatar.url(email);

  const newUser = await User.create({
    ...body,
    password: hashPassword,
    avatarUrl,
  });

  return { email: newUser.email, message: "User created" };
};

const login = async (body) => {
  const { email, password } = body;

  const user = await User.findOne({ email });

  if (!user) {
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
};
