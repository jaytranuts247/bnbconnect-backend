const express = require("express");
const router = express.Router();

const Joi = require("joi");
const joiValidator = require("../middlewares/joiValidator");
const Schemas = require("../middlewares/Schemas");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../model/User");
const jwtSecret =
  process.env.NODE_ENV !== "production"
    ? config.get("jwtSecret")
    : process.env.SECRET;

// @router   POST api/users
// @desc     Register a user
// @access   Public
router.post(
  "/",
  joiValidator(Schemas.userRegister, "body"),
  async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);

    try {
      let user = await User.findOne({ email });

      // check if user is exists
      if (user) return res.status(400).json({ msg: "user already exists" });

      // if not, create new user - mongodb auto add _id to user
      user = new User({
        firstName,
        lastName,
        email,
        password,
      });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save(); // save user to db

      // make token and send res
      const payload = {
        user: {
          _id: user._id,
        },
      };

      jwt.sign(
        payload,
        jwtSecret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          console.log(token);
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
