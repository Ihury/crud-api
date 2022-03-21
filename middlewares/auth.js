const jwt = require("jsonwebtoken");
const mysql = require("mysql2")

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization)
    return res.status(401).json({ message: "Token not provided!" });

  const parts = authorization.split(" ");

  if (parts.length !== 2)
    return res.status(401).json({ message: "Token error!" });

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme))
    return res.status(401).json({ message: "Token malformatted!" });

  jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token invalid!" });

    req.userId = decoded.id;

    db.query(`SELECT * FROM usuario WHERE usuario.id = ${decoded.id}`, (err, result) => {
      if (err) return res.status(400).json({ message: "Database error!" });

      req.user = result[0];

      return next();
    })    
  });
};