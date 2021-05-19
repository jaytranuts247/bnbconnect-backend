const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  listing_id: String,
  author_id: String,
  author_name: String,
  reviewContent: String,
  accuracy: Number,
  communication: Number,
  cleanliness: Number,
  location: Number,
  checkin: Number,
  value: Number,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model("Review", ReviewSchema);
