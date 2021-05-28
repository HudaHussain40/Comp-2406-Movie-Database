

const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("./PeopleModel");
const Movie = require("./MovieModel");
const User = require('./UserModel');
const express = require('express');
let router = express.Router();

router.get("/", loggedIn, (req, res) => {
	let q = {}
	if(req.query.Name && !(req.query.Name ==='')) {
		q.Name = {$regex: "^"+req.query.Name, $options:"$i"}
	}
	console.log(q);

	Person.find(q, function(err,result) {
		if (err) {
			res.status(500).send("Error reading database.");
			return;
		}
		p = result;
		console.log(result);
		if(req.accepts('html')) {
			res.status(200).render('people', {people: p});
		}
		else if(req.accepts('application/json')) {
			let actors = []
			let limit = 10;
			if (result.length < 10) {
				limit = result.length;
			}
			for(let i =0; i < limit; i++) {
				actors.push(result[i].Name);
			}
			console.log(actors);
			res.status(200).send(JSON.stringify(actors));
		}
		
	})
});


router.get("/:personId",loggedIn, (req, res) => {
	let oid;
	let value = req.params.personId;
	console.log("Finding Person by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("Person ID " + value + " does not exist.");
		return;
	}
	Person.findById(value).populate([{path: 'Directed', select: 'Title', model: 'Movie'}, {path: 'Wrote',select: 'Title', model: 'Movie'}, {path: 'Acted',select: 'Title', model: 'Movie'},]).exec(function(err, result) {
		if(err){
			res.status(500).send("Internal database error.\n");
			return;
		}
		if(!result){
			console.log("Could not find result");
			res.status(404).send("Unknown ID");
			return;
		}
		console.log(result);
		result.getFrequentCollabs((err, r) => {
			if (err) {
				res.status(500).send("Error reading database.");
				return;
			}
			result.frequentCollaborators = r;
			User.findById(req.session.userId, function (err, n) {
			if (err) {
				res.status(500).send("Error reading database.");
				return;
			}
			if (n.peopleFollowing.includes(value)) {	
				result.following = true;
			}
			console.log(result);
			if(req.accepts('html')) {
				res.status(200).render("person",  {person: result, session: req.session});
			}
			else if(req.accepts('application/json')) {
				res.status(200).send(JSON.stringify(result));
			}
			
			return;
		});});
 	 });
});

router.post("/", loggedIn, (req,res)=> {
	let p = (req.body);
	console.log(p);
	if(!req.session.Contributing){
		res.status(401).send("Not authorized");
		return;
	}
	User.findById(req.session.userId, (err,r)=> {
		if (err) {
			res.status(500).send("Error reading database.");
			return;
		}
		if(!r.Contributing) {
			res.status(401).redirect('/contribute');
			return;
		}
		Person.findOne({Name: {$regex: "^"+req.body.Name, $options:"i"}}, (err,result)=> {
			if(err) {
				res.status(500).send("Internal database error.");
				return;
			}
			console.log(result)
			if(!result){
				let name = p.Name;
				name = name.split(" ");
				for(let i =0; i < name.length; i++) {
					name[i] = firstLetterUpperCase(name[i]);
				}
				name = name.join(" ");
				console.log(name);
				let n = new Person({Name: name});
				n.save((err, result) => {
					if(err) {
						res.status(500).send("Internal database error.\n");
						return;
					}
					console.log("crated new");
					res.status(201).send();
					return;
				})
			}
			else {
				res.status(409).send();
				return;
			}
		})	
	}) 
}) 

function firstLetterUpperCase(string) {
	if(string === "") {
		return "";
	}
	if(string.length == 1) {
		return string.charAt(0).toUpperCase();
	}
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function loggedIn(req, res, next) {
	console.log("Router session "+ req.session.userId);
	if(!req.session.loggedIn) {
		res.redirect('/login');
		return;
	}
	next();
}	

async function contributing(userId) {
	let result = await User.findById(userId);	
	if(result.Contributing) {
		console.log("yea")
		return true;
	}
	else{
		return false;
	}
}

//Export the router so it can be mounted in the main app
module.exports = router;