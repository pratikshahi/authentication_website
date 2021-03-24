//jshint esversion:6
require("dotenv").config(); //using dotenv to encrypt,always put on top
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //using hashing
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/authWebUserDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.route("/").get(function (req, res) {
  res.render("home");
});

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });
      newUser.save(function (err) {
        if (!err) {
          res.render("secrets");
        } else {
          res.send(err);
        }
      });
    });
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        if (foundItem) {
          bcrypt.compare(password, foundItem.password, function (err, result) {
            if (result === true) {
              res.render("secrets");
            }
          });
        }
      }
    });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
