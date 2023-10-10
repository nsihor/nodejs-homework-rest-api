const Joi = require("joi");
const { Schema, model } = require("mongoose");
const handleMongooseError = require("../helpers/handleMongooseError");

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,
    avatarUrl: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

// ----------Joi-----------

const userJoiSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  subscription: Joi.string().valid("starter", "pro", "business").optional(),
});

const updateSubscriptionJoiSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business"),
});

module.exports = { User, userJoiSchema, updateSubscriptionJoiSchema };
