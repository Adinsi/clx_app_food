const mongoose = require("mongoose");
const mongoose_sanitize = require("mongoose-sanitize");
const unique_validator = require("mongoose-unique-validator");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    tel: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    resetLink: {
      type: String,
      default: "",
    },
    resetId: {
      type: String,
      default: "",
    },
    following: {
      type: [String],
    },
    followers: {
      type: [String],
    },
    picture: {
      type: String,
      default: "../image/user.png",
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre(
//   "save",
//   mongoose_sanitize({
//     replaceWith: "_",
//     escape: true,
//     remove: ["$"],
//   })
// );
userSchema.plugin(unique_validator);

module.exports = mongoose.model("user", userSchema);
