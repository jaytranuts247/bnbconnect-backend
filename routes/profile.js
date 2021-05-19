const express = require("express");
const moment = require("moment");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const Profile = require("../model/Profile");

// get new profile intro
router.get("/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    const profile = await Profile.findOne({ user_id });

    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

// post new profile intro
router.post("/", authMiddleware, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user_id: req.body.user_id });
    if (profile)
      res.status(400).json({ msg: "user profile has already existed" });

    profile = new Profile({
      ...req.body,
      updateAt: new Date(),
      createdAt: new Date(),
    });

    const newProfile = await profile.save();
    res.json(newProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

router.patch("/", authMiddleware, async (req, res) => {
  try {
    let updatedProfile = await Profile.findOneAndUpdate(
      { user_id: req.body.user_id },
      {
        $set: { ...req.body, updateAt: new Date() },
      },
      { new: true }
    );
    res.json(updatedProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

router.delete("/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  try {
    let deletedProfile = await Profile.findOneAndDelete({ user_id });
    res.json(deletedProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;
