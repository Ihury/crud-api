require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// testing database connection
db.promise()
  .query("SELECT version();")
  .then((res) =>
    console.log(
      `Database successfully connected. Version: ${res[0][0]["version()"]}`
    )
  )
  .catch((err) => console.error(err));

// api routes
require("./controllers/authController")(app);
require("./controllers/usersController")(app);

app.get("/", async (req, res) => {
  res.redirect("/usuarios/")
});

app.listen(process.env.API_PORT, () =>
  console.log(
    `\n=======================\nServer started on port http://localhost:${process.env.API_PORT}/\n=======================\n`
  )
);
