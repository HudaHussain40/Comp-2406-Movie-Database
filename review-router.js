

const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("./PeopleModel");
const Movie = require("./MovieModel");
const Notification = require("./NotificationModel");
const Review = require("./ReviewModel");
const User = require('./UserModel');
const express = require('express');
let router = express.Router();



router.get("/:reviewId",loggedIn, (req, res) => {
	let oid;
	let value = req.params.reviewId;
	console.log("Finding Review by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("Review ID " + value + " does not exist.");
		return;
	}
	Review.findById(value).populate([{path: 'userId', select: 'userName',model: 'User'},{path: 'movieId', select: 'Title', model: 'Movie'}]).exec(function(err, result) {
		if(err){
			res.status(500).send("Error reading database.\n"+err);
			return;
		}
		if(!result){
			console.log("Could not find result");
			res.status(404).send("Unknown ID");
			return;
		}
		console.log(result);
		if(req.accepts('html')) {
			res.status(200).render("review",  {review: result,session:req.session});
		}
		else if(req.accepts('application/json')) {
			res.status(200).send(JSON.stringify(result));
		}
	});
  });

  router.post("/",loggedIn, (req, res) => {
	if(!req.body.hasOwnProperty("reviewSummary") || !req.body.hasOwnProperty("reviewText")|| !req.body.hasOwnProperty("Rating") || !req.body.hasOwnProperty("movieId") || !req.body.hasOwnProperty("userId")) {
		res.status(400).send("Invalid Request");
		return;
	}
	if (req.session.userId != req.body.userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	let user = User.findById(req.body.userId);
	let movie = Movie.findById(req.body.movieId);
	Promise.all([user, movie]).then( (values) => {
		console.log(values[0]);
		console.log(values[1]);
		if(!values[0] || !values[1]) {
			databaseError();
		}
		let r = new Review({
			userId:req.body.userId,
			movieId:req.body.movieId,
			reviewSummary:req.body.reviewSummary,
			reviewText:req.body.reviewText,
			Rating: req.body.Rating
		})
		values[1].Reviews.push(r._id);
		values[0].Reviews.push(r._id);
		r.save((err)=> {
			if(err) {
				res.status(500).send("Internal Database Error ");
				return;
			}
			values[1].save((err, result)=> {
				if (err) {
					res.status(500).send("Internal Database Error ");
					return;
				}
				let n = {goTo:r._id, Person:false, Details:"made a new review", Name:values[0].userName}
				values[0].Notify(n,(err, result)=> {
					if(err) {
						res.status(500).send("Internal Database Error ");
						return;
					}
					values[0].save((err) => {
						if (err) {
							res.status(500).send("Internal Database Error");
							return;
						}
						console.log("lets go");
						res.status(200).redirect('/reviews/'+r._id);
					});
				});
			})})})
	.catch((err)=> {
		res.status(500).send("Internal Database Error");
		return;
		});
  });


  function loggedIn(req, res, next) {
	console.log("Router session "+ req.session.userId);
	if(!req.session.loggedIn) {
		res.redirect('/login');
		return;
	}
	next();
}	

//Export the router so it can be mounted in the main app
module.exports = router;