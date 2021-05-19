const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema({
  listing_id: String,
  guest_id: String,
  checkIn: Date,
  checkOut: Date,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model("Booking", BookingSchema);
