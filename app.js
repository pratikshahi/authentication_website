//jshint esversion:6
require("dotenv").config(); //using dotenv to encrypt,always put on top
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5"); //using hashing

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
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password), ////using hash function md5 on password to stor in db
    });
    newUser.save(function (err) {
      if (!err) {
        res.render("secrets");
      } else {
        res.send(err);
      }
    });
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const username = req.body.username;
    const password = md5(req.body.password); //checking login entered pass with db hash

    User.findOne({ email: username }, function (err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        if (foundItem) {
          if (foundItem.password === password) {
            res.render("secrets");
          }
        }
      }
    });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
