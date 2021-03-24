//jshint esversion:6
require("dotenv").config(); //using dotenv to encrypt,always put on top
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session"); //for passport method of authentication require all 3
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
//made sessions
app.use(
  session({
    secret: "This is our secret text",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize()); //initialize Passport
app.use(passport.session()); //made passport to manage session

mongoose.connect("mongodb://localhost:27017/authWebUserDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true); //to remove deprecation warning
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); //made userSchema to use passportlocalmongose as plugin

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); //created local login strategy to serailze and deserailize

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/").get(function (req, res) {
  res.render("home");
});

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    //register is method from passpot local mongoose
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
        }
      }
    );
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    //login method comes from passport
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          //authenticate user
          res.redirect("/secrets");
        });
      }
    });
  });

app
  .route("/secrets")

  .get(function (req, res) {
    if (req.isAuthenticated()) {
      //check if user is authenticated
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

app
  .route("/logout")

  .get(function (req, res) {
    req.logout();
    res.redirect("/");
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
