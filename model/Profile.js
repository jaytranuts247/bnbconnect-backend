const mongoose = require("mongoose");

const ProfileSchema = mongoose.Schema({
  user_id: String,
  intro: String,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model("Profile", ProfileSchema);
