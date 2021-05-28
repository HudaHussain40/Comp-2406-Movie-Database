

const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("./PeopleModel");
const Movie = require("./MovieModel");
const Notification = require("./NotificationModel");
const Review = require("./ReviewModel");
const User = require('./UserModel');
const express = require('express');
let router = express.Router();

router.get("/:userId", loggedIn, (req, res) => {
	let value = req.params.userId;
	User.findById(value).populate([{path: 'Reviews', model: 'Review'},{path: 'watchList', model: 'Movie', select: ["Title", "Genre"]}, {path: 'usersFollowing', select: 'userName', model: 'User'},{path: 'peopleFollowing', select: 'Name', model: 'Person'}, {path: 'Notifications', model: 'Notification'}]).exec(function(err, result) {
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		if(!result){
			console.log("Could not find result");
			res.status(404).send("Unknown User");
			return;
		}
		if (req.session.userId != value) {
			console.log("Session is not equal to value\n");
			User.findById(req.session.userId, function (err, n) {
				if(err){
					res.status(500).send("Error reading database.");
					return;
				}
				if (n.usersFollowing.includes(value)) {	
					result.following = true;
				}
				result.Recommended = [];
				res.status(200).render("profile",  {user: result, session: req.session});
				return;
			})
		}
		else {
			result.Recommended((err,r)=>{
				if(err){
					res.status(500).send("Error reading database.");
					return;
				}
				result.Recommended = r;
				if(req.accepts('html')) {
					res.status(200).render("profile",  {user: result, session: req.session});
				}
				else if(req.accepts('application/json')) {
					res.status(200).send(JSON.stringify(result));
				}
				
			})
		}
	});
  });

  router.post("/", (req, res)=> {
	let password =req.body.password;
	let userName = req.body.username;
	console.log(req.query.username);
	console.log(password + userName);
	if(!password || !userName) {
		res.status(400).send("Please enter a username and password");
		return
	}

	User.findOne({'userName': userName}, function(err, result) {
		if(err) {
			res.status(500).send("Database error");
			return;
		}
		else if (result) {
			res.status(409).redirect("/login?error=true");
			return;
		}
		else {
			let u = new User({userName: userName, Password: password, Contributing: false});
			u.save(function (err,result){
				if(err) {
					res.status(500).send("Internal Database Error");
					return;
				}
				req.session.loggedIn = true;
				req.session.userId = result._id;
				req.session.userName = result.userName;
				req.session.Contributing = result.Contributing;
				res.status(201).redirect('/users/'+u._id);
			});
		}
	});
  })

  router.delete("/:userId/followedPeople/:personId", loggedIn, (req,res) => {
	let userId = req.params.userId;
	let personId = req.params.personId;
	
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	let user = User.findById(userId);
	let person = Person.findById(personId);
	Promise.all([user, person]).then( (values) => {
		if(!values[0] || !values[1]) {
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
		}
		console.log(values[0]);
		console.log(values[1]);
		let newPeople = remove(personId, values[0].peopleFollowing);
		let newFollowers = remove(userId, values[1].Followers);
		console.log(newPeople);
		console.log(newFollowers);
		values[0].peopleFollowing = newPeople;
		values[1].Followers = newFollowers;
		values[1].save((err, result)=> {
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			values[0].save((err, result)=> {
				if (err) {
					res.status(500).send("Internal Database Error");
					return;
				}
				res.status(200).send();
			}
			)});
	})
	.catch((err)=> {
		res.status(500).send("Internal Database Error");
		return;
		}
	)
  })

  router.delete("/:userId/followedUsers/:otherUserId", loggedIn, (req,res) => {
	let userId = req.params.userId;
	let otherUserId = req.params.otherUserId;
	
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	let user = User.findById(userId);
	let otherUser = User.findById(otherUserId);
	Promise.all([user, otherUser]).then( (values) => {
		console.log(values[0]);
		console.log(values[1]);
		if(!values[0] || !values[1]) {
			res.status(500).send("Internal Database Error");
			return;
		}
		let newUsers = remove(otherUserId, values[0].usersFollowing);
		let newFollowers = remove(userId, values[1].Followers);
		console.log(newUsers);
		console.log(newFollowers);
		values[0].usersFollowing = newUsers;
		values[1].Followers = newFollowers;
		values[1].save((err, result)=> {
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			values[0].save((err, result)=> {
				if (err) {
					res.status(500).send("Internal Database Error");
					return;
				}
				res.status(200).send();
			}
			)});
	})
	.catch((err)=> {
		res.status(500).send("Internal Database Error");
		return;
		}
	)
  })

  router.delete("/:userId/watchList/:movieId", loggedIn, (req,res) => {
	console.log("IN delete request");
	let userId = req.params.userId;
	let movieId = req.params.movieId;
	
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	User.findById(userId, (err, result) => {
		result.watchList = remove(movieId, result.watchList);
		if(err) {
			res.status(500).send("Internal Database Error");
			return;
		}
		result.save((err, result) => {
			if(err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			res.status(200).send();
		})
	});
	
  })

  router.delete("/:userId/notifications/:notifId", loggedIn, (req,res) => {
	console.log("IN delete request");
	let userId = req.params.userId;
	let notifId = req.params.notifId;
	
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	User.findById(userId, (err, result) => {
		result.Notifications = remove(notifId, result.Notifications);
		if (err) {
			res.status(500).send("Internal Database Error");
			return;
		}
		Notification.deleteOne({_id: notifId}, (err)=> {
		if(err) {
			res.status(500).send("Internal Database Error");
			return;
			}
		result.save((err, result) => {
			if(err) {
				res.status(500).send("Internal Database Error");
				return;
				}
			res.status(200).send();
			})
		});
	
  	})
	});

	router.post("/:userId/followedUsers", loggedIn, (req,res) => {
		let userId = req.params.userId;
		let otherUserId = req.body.otherUserId;
		
		if (req.session.userId != userId) {
			res.send(401).send("You are not authorised to do this");
			return;
		}
		let user = User.findById(userId);
		let otherUser = User.findById(otherUserId);
		Promise.all([user, otherUser]).then( (values) => {
			if(!values[0] || !values[1]) {
				res.status(500).send("Internal Database Error");
				return;
			}
			values[0].usersFollowing.push(values[1]._id);
			values[1].Followers.push(values[0]._id);
			values[1].save((err, result)=> {
				if (err) {
					res.status(500).send("Internal Database Error ");
					return;
				}
				values[0].save((err, result)=> {
					if (err) {
						res.status(500).send("Internal Database Error");
						return;
					}
					res.status(201).redirect('/users/'+otherUserId);
				}
				)});
		})
		.catch((err)=> {
			res.status(500).send("Internal Database Error");
			return;
			}
		)
	  })


	router.put("/:userId", loggedIn, (req,res) => {
	console.log("IN put request");
	let userId = req.params.userId;
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	let c = req.body
	console.log(c.Contributing);
	User.findById(userId, (err, result) => {
		if (err) {
			res.status(500).send("Internal Database Error");
			return;
		}
		result.Contributing = c.Contributing;
		req.session.Contributing = result.Contributing;
		result.save((err, result) =>{
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			res.status(200).send();
		}
		);
	});
	
  })

  router.post("/:userId/watchList", loggedIn, (req,res) => {
	console.log("In adding movie");
	let userId = req.params.userId;
	let movieId = req.body.movieId;
	console.log(movieId);
	
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	User.findById(userId, (err, result) => {
		if (err) {
			res.status(500).send("Internal Database Error");
			return;
		}
		if(!result.watchList.includes(movieId)) {
			console.log(movieId);
			result.watchList.push(movieId);
		}
		result.save((err) => {
			if (err) {
				res.status(500).send("Internal Database Error");
				return;
			}
			console.log(result);
			res.status(201).redirect("/movies/"+movieId);

		})
		
  })
});

router.post("/:userId/followedPeople", loggedIn, (req,res) => {
	console.log("IN follow request");
	let userId = req.params.userId;
	let personId = req.body.personId;
	if (req.session.userId != userId) {
		res.send(401).send("You are not authorised to do this");
		return;
	}
	let user = User.findById(userId);
	let person = Person.findById(personId);
	Promise.all([user, person]).then( (values) => {
		console.log(values[0]);
		console.log(values[1]);
		if(!values[0] || !values[1]) {
				res.status(500).send("Internal Database Error");
				return;
		}
		if(!values[0].peopleFollowing.includes(personId)) {
			values[0].peopleFollowing.push(values[1]._id);
		}
		if(!values[1].Followers.includes(userId)) {
			values[1].Followers.push(values[0]._id);
		}
		console.log(values[0]);
		console.log(values[1]);
		values[1].save((err, result)=> {
			if (err) {
				res.status(500).send("Internal Database Error ");
				return;
			}
			values[0].save((err, result)=> {
				if (err) {
					res.status(500).send("Internal Database Error");
					return;
				}
				res.status(201).redirect('/people/'+personId);
			}
			)});
	})
	.catch((err)=> {
		res.status(500).send("Internal Database Error");
		return;
		}
	)
  });


function loggedIn(req, res, next) {
		console.log("Router session "+ req.session.userId);
		if(!req.session.loggedIn) {
			res.redirect('/login');
			return;
		}
		next();
}	

function remove(value, array) {
	let n = [];
	for (let i = 0; i < array.length; i++) {
		if(array[i] != value) {
			n.push(array[i]);
		}
	}
	return n;
}

//Export the router so it can be mounted in the main app
module.exports = router;

