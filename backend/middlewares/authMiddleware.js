const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY_CHANGE_ME";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") return res.status(401).json({ error: "Invalid token type." });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};
