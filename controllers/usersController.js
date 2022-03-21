const express = require("express");
const mysql = require("mysql2");
const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/admin");

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

const router = express.Router();

// database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get("/", authMiddleware, (req, res) => {
  if (req.query.id) {
    db.query(
      `SELECT * FROM usuario WHERE id = ${req.query.id}`,
      (err, result) => {
        if (err) return res.status(400).json({ message: "Database error!" });

        result.senha = undefined;

        res.send(result[0]);
      }
    );
  } else {
    db.query("SELECT * FROM usuario ORDER BY nome ASC;", (err, result) => {
      if (err) return res.status(400).json({ message: "Database error!", err });

      for (const user of result) delete user.senha;

      res.send(result);
    });
  }
});

router.post("/create", authMiddleware, adminMiddleware, (req, res) => {
  const { nome, status, cpf, login, senha, observacao, admin } = req.body;

  if (!nome || !status || !cpf || !login || !senha || !observacao)
    return res.status(400).json({ message: "Please provide all fields!" });

  if (!cpf.match(cpfRegex))
    return res.status(400).json({ message: "Invalid CPF syntax!" });

  db.query(
    `INSERT INTO usuario (nome, status, cpf, login, senha, observacao, admin) VALUES ('${nome}', '${status}', '${cpf}', '${login}', '${senha}', '${observacao}', ${admin})`,
    (err, result) => {
      if (err) return res.status(400).json({ message: "Database error!", err });

      res.send({
        message: "User successfully created!",
        user: { nome, status, cpf, login, observacao, admin },
      });
    }
  );
});

router.delete("/delete", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.body;

  if (!id)
    return res.status(400).json({ message: "Please provide user id!", err });

  db.query(`DELETE FROM usuario WHERE id = ${id};`, (err, result) => {
    if (err) return res.status(400).json({ message: "Database error!" });

    res.send({ message: "User successfully deleted!", userId: id });
  });
});

router.put("/update", authMiddleware, adminMiddleware, (req, res) => {
  const { id, user } = req.body;
  const { nome, status, cpf, login, senha, observacao, admin } = user;

  if (!id || !nome || !status || !cpf || !login || !senha || !observacao)
    return res.status(400).json({ message: "Please provide all fields!" });

  if (!cpf.match(cpfRegex))
    return res.status(400).json({ message: "Invalid CPF syntax!" });

  db.query(
    `UPDATE usuario SET nome = '${nome}', status = '${status}', cpf = '${cpf}', login = '${login}', senha = '${senha}', observacao = '${observacao}', admin = ${admin} WHERE id = ${id};`,
    (err, result) => {
      if (err) return res.status(400).json({ message: "Database error!", err });

      res.send({
        message: "User successfully updated!",
        user: { nome, status, cpf, login, observacao, admin },
      });
    }
  );
});

module.exports = (app) => app.use("/usuarios", router);
