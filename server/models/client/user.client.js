const mongoose = require("mongoose");
const mongoose_sanitize = require("mongoose-sanitize");
const unique_validator = require("mongoose-unique-validator");
const user_client = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    commune: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    ifu: {
      type: String,
      required: true,
      unique: true,
    },
    id_piece: {
      type: String,
      required: true,
      unique: true,
    },
    tel: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
    },
    code: {
      default: "",
      type: String,
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isClient: {
      type: Boolean,
      default: false,
    },
    resetLink: {
      type: String,
      default: "",
    },
    resetId: {
      type: String,
      default: "",
    },
    met: {
      type: [
        {
          clientId: String,
          nameMet: String,
          priceMet: Number,
          imgMet: String,
          MetBoisson: String,
          priceBoisson: Number,
          imgBoisson: String,
          timestamp: Number,
        },
      ],
      required: true,
    },

    picture: {
      type: String,
      default: "../image/client.png",
    },
  },
  { timestamps: true }
);

user_client.plugin(unique_validator);

user_client.plugin(mongoose_sanitize, {
  replaceOne: [
    {
      from: "enfoiré",
      to: "_",
    },
  ],
  bannedWords: ["jeu", "mourrir"],
  escape: true,
});

module.exports = mongoose.model("user_client", user_client);
