const express = require("express");
const moment = require("moment");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const joiValidator = require("../middlewares/joiValidator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const Schemas = require("../middlewares/Schemas");
const Booking = require("../model/Booking");

// @router   GET bookings
// @desc     get all bookings
// @access   Public
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    if (bookings) res.json({ bookings });
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});

// @router   GET bookings for specific User
// @desc     get all bookings for specific User
// @access   Public
router.get("/:userId", authMiddleware, async (req, res) => {
  const userId = req.params.userId;
  try {
    const bookingList = await Booking.find({ guest_id: userId });
    // console.log(bookingList);
    res.json(bookingList);
  } catch (err) {
    console.log(err.messasge);
  }
});

// @router   POST bookings
// @desc     create bookings for specific user
// @access   Public
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log(new Date());
    const newBooking = new Booking({
      ...req.body,
      // startDate: moment(req.body.startDate),
      // endDate: moment(req.body.endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // check if booking existed in DB
    const overlappedBookingList = await Booking.find({
      listing_id: req.body.listing_id,
      $nor: [
        {
          $and: [
            { checkIn: { $lt: req.body.checkIn } },
            { checkOut: { $lt: req.body.checkOut } },
          ],
        },
        {
          $and: [
            { checkIn: { $gt: req.body.checkIn } },
            { checkOut: { $gt: req.body.checkOut } },
          ],
        },
      ],
    });

    console.log("overlappedBookingList", overlappedBookingList);
    if (overlappedBookingList.length > 0)
      return res.json({
        msg: "Your Booking day range is overalapped with others",
      });

    // if not, then save to DB
    const booking = await newBooking.save();
    if (booking) {
      console.log(booking);
      console.log("successfully add new booking");
    }
    res.json(booking);
  } catch (err) {
    console.log(err, err.message);
    res.send(err);
  }
});

router.patch("/:bookingId", authMiddleware, async (req, res) => {
  const bookingId = req.params.bookingId;
  try {
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: bookingId },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true }
    );
    console.log("Successfully updating booking", updatedBooking);
    res.json(updatedBooking);
  } catch (err) {
    console.log(er.message);
    res.json(err.message);
  }
});

router.delete("/:bookingId", authMiddleware, async (req, res) => {
  const bookingId = req.params.bookingId;
  try {
    const deletedBooking = await Booking.findOneAndDelete({ _id: bookingId });
    console.log(deletedBooking);
    res.json(deletedBooking);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    const dbRes = await Booking.remove({});
    console.log("Successfully remove all bookings");
    console.log(dbRes);
    res.json(dbres);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});

module.exports = router;

// $and: [
//   { guest_id: req.body.guest_id },
//   {
//     $not: {
//       $or: [
//         {
//           $and: [
//             { startDate: { $lte: req.body.startDate } },
//             { endDate: { $lte: req.body.startDate } },
//           ],
//         },
//         {
//           $and: [
//             { startDate: { $gte: req.body.endDate } },
//             { endDate: { $gte: req.body.endDate } },
//           ],
//         },
//       ],
//     },
//   },
// ],
