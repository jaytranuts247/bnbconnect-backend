const Joi = require("joi");

const joiValidator = (schema, property) => {
  return (req, res, next) => {
    const result = schema.validate(req[property]);
    const { value, error } = result;

    const isValid = error == null; // use '==' as undefined vs null

    if (isValid) {
      next();
    } else {
      // console.log(error);
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      console.log("error", message);
      res.status(442).json({
        msg: message,
      });
    }
  };
};

module.exports = joiValidator;
