const express = require("express");
const moment = require("moment");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const joiValidator = require("../middlewares/joiValidator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const Schemas = require("../middlewares/Schemas");
const Review = require("../model/Review");

const defaultReviews = [
  "This is dummy reviews.",
  "You can add review to listings",
];

// @router   GET reviews
// @desc     get all reviews of current listing
// @access   Public
router.get("/:listing_id", async (req, res) => {
  const { listing_id } = req.params;

  try {
    var reviews = await Review.find({ listing_id });

    // add two reviews to db
    if (reviews.length === 0) {
      const newReviews = defaultReviews.map((item) => ({
        listing_id,
        author_id: "609052677bced9a9f7009918",
        author_name: "Jay Tran",
        reviewContent: item,
        accuracy: 5,
        communication: 5,
        cleanliness: 5,
        location: 5,
        checkin: 5,
        value: 5,
      }));

      await Promise.all(
        newReviews.map(async (review) => {
          let newReview = new Review({
            ...review,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return await newReview.save();
        })
      );

      reviews = await Review.find({ listing_id });
    }
    res.json(reviews);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});

// @router   GET reviews
// @desc     get specific review
// @access   Public
router.get("/:listing_id/:user_id", async (req, res) => {
  const { listing_id, user_id } = req.params;
  try {
    const review = await Review.findOne({
      listing_id,
      author_id: user_id,
    });
    res.json(review);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});
// @router   POST reviews
// @desc     create new review for listing
// @access   Public
router.post(
  "/",
  [joiValidator(Schemas.review, "body"), authMiddleware],
  async (req, res) => {
    const { listing_id, author_id } = req.body;

    try {
      //check for review is already existed
      let reviewExisted = await Review.findOne({
        listing_id,
        author_id,
      });

      console.log(reviewExisted);

      if (reviewExisted)
        return res
          .status(400)
          .json({ msg: "User have already made review for this listing" });

      // create review object
      let newReview = new Review({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // save review
      const savedReview = await newReview.save();

      res.json(savedReview);
    } catch (err) {
      console.log(err.message);
      res.json(err.message);
    }
  }
);

// @router   PATCH reviews
// @desc     update review
// @access   Public
router.patch("/", authMiddleware, async (req, res) => {
  const { _id } = req.body;
  try {
    const updatedReview = await Review.findOneAndUpdate(
      { _id },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true }
    );
    console.log("review is updated", updatedReview);
    res.json(updatedReview);
  } catch (err) {
    console.log(err.message);
    res.json({ msg: err.message });
  }
});

// @router   DELETE reviews
// @desc     delete review
// @access   Public
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  const reviewId = req.params.reviewId;
  try {
    const deletedReview = await Review.findOneAndDelete({ _id: reviewId });
    console.log("Review is deleted", deletedReview);
    res.json(deletedReview);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
});

module.exports = router;
