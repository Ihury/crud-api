const express = require("express")
const jwt = require("jsonwebtoken")
const mysql = require("mysql2")

const router = express.Router()

// database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function generateToken(params = {}) {
  return jwt.sign(params, process.env.AUTH_SECRET, {
    expiresIn: 86400,
  });
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Please provide username and password" });

  db.query(
    `SELECT * FROM usuario WHERE login = '${username}'`,
    (err, result) => {
      if (err) 
        return res.status(400).json({ message: "Database error!" });

      const user = result[0];

      if (!user)
        return res.status(401).json({ message: "Username not found!" });

      if (user.senha !== password)
        return res.status(401).json({ message: "Wrong password!" });

      const token = generateToken({ id: user.id});

      delete user.senha

      res.send({ user, token });
    }
  );
});

module.exports = app => app.use("/admin", router)