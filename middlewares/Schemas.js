const Joi = require("joi");

const Schemas = {
  userRegister: Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string(),
    confirmedPassword: Joi.ref("password"),
  }),
  userLogin: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string(),
  }),
  review: Joi.object({
    listing_id: Joi.string().required(),
    author_id: Joi.string().required(),
    author_name: Joi.string(),
    reviewContent: Joi.string(),
    accuracy: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    cleanliness: Joi.number().min(1).max(5),
    location: Joi.number().min(1).max(5),
    checkin: Joi.number().min(1).max(5),
    value: Joi.number().min(1).max(5),
  }),
};

module.exports = Schemas;

// const userRegisterSchema = Joi.object({
// 	name: Joi.string().alphanum().min(3).max(30).required(),
// 	email: Joi.string().email({
// 		minDomainSegments: 2,
// 		tlds: { allow: ["com", "net"] },
// 	}),
// 	password: Joi.string(), //  .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
// 	confirmedPassword: Joi.ref("password"),
// }).with("password", "confirmedPassword");
