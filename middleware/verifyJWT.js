const jwt = require("jsonwebtoken");
require("dotenv").config();

// Checks if the user has a valid token before executing the request
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({"result": "Missing authorization header"});
  
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(401);
      req.user = decoded.username;
      next()
    });
}

module.exports = verifyJWT