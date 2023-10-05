const { User } = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

const register = async (body) => {
  const { email, password } = body;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return { message: "Email in use" };
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...body, password: hashPassword });

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

  return token;
};

const logout = async (id) => User.findByIdAndUpdate(id, { token: "" });

const getCurrent = async (body) => body;

const updateSubscription = async (id, subscription) =>
  User.findByIdAndUpdate(id, { subscription });

module.exports = { register, login, getCurrent, logout, updateSubscription };
