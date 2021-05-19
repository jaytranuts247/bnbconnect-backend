const jwt = require("jsonwebtoken");
const config = require("config");

const jwtSecret =
  process.env.NODE_ENV !== "production"
    ? config.get("jwtSecret")
    : process.env.SECRET;

const authMiddleware = (req, res, next) => {
  // get token from header - added from setAuthToken from frontend
  const token = req.header("x-auth-token");

  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "token is not valid" });
  }
};

module.exports = authMiddleware;
