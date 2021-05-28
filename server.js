
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Movie = require("./MovieModel");
const Person = require('./PeopleModel');
const Review = require('./ReviewModel');
const User = require('./UserModel');
const express = require('express')
const http = require('http');
const app = express();
const path = require("path");
const session = require('express-session');
app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json())
app.use(express.urlencoded({extended: true})); // this is used to parse form data

app.use(session(
    {
        secret: 'This is a very secret key hehe',
		cookie: {
			maxAge: 50000000
		},
    }
))
let personRouter = require("./person-router");
app.use("/people", personRouter);
let userRouter = require("./user-router");
app.use("/users", userRouter);
let reviewRouter = require("./review-router");
app.use("/reviews", reviewRouter);
let movieRouter = require("./movie-router");
app.use("/movies", movieRouter);




app.route("/login")
	.post(function (req, res) {
	if (req.session.loggedIn) {
			console.log("Already logged in");
			res.status(200).redirect("/users/"+req.session.userId);
			return;
		}
	  let userName = req.body.username;
	  let password = req.body.password;

	  User.findOne({'userName': userName}, (err, result) => {
		if (err) {
			res.status(500).send("Internal Database Error");
			return;
		}
		if (!result) {
			res.redirect('/login/?error=true');
			return;
		}
		console.log(result);
		console.log(result.Password + " "+ password);
		if (result.Password === password) {
			req.session.loggedIn = true;
			req.session.userId = result._id;
			req.session.userName = result.userName;
			req.session.Contributing = result.Contributing;
			res.redirect("/users/"+result._id);
		}
		else {
			res.status(401).redirect('/login/?error=true');
		}
	  });
	})
	.get(function(req, res) {
		if (req.session.loggedIn) {
			console.log("Already logged in");
			res.status(302).redirect("/users/"+req.session.userId);
			return;
		  }
		if (req.query.hasOwnProperty('error')) {
			if (req.query.error === "true") {
				res.status(404).render("login", {error: "Invalid Credentials"});
				return;
			}
		}
		res.status(200).render('login',{});
	})


	function loggedIn(req, res, next) {
		if(!req.session || !req.session.loggedIn) {
			res.status(400).redirect('/login');
			return;
		}
		next();
}	

app.route('/search').get(loggedIn, function(req, res) {
		Movie.distinct("Genre", (err,result)=> {
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			console.log(result);
			res.status(200).render('search',{session: req.session, genre: result});
		})
		
	});

app.route('/contribute').get(loggedIn, function(req, res) {
		if(!req.session.Contributing) {
			res.status(401).render('contribute',{Contributing: false, session: req.session});
			return;
		}
		res.status(200).render('contribute',{Contributing: true,session: req.session});
});


app.route('/logout').get(loggedIn, function(req, res) {
		req.session.destroy();
		res.status(200).redirect('/');
	});

  // Initialize database connection
  mongoose.connect('mongodb://localhost:27017/MovieDatabase', {useNewUrlParser: true});

  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
		  app.listen(3000);
		  console.log("Server listening on port 3000");
	  
  });