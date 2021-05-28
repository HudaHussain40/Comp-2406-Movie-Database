
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Movie = require("./MovieModel");
const Person = require('./PeopleModel');
const Review = require('./ReviewModel');
const User = require('./UserModel');

const express = require('express');
let router = express.Router();



router.get("/", loggedIn, async (req, res) => {
	let l = 10;
	if(!req.query.page || req.query.page < 1) {
		req.query.page = 1;
	}

	let start_index = ((req.query.page-1)*l);
	let q = {};
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		if(prop === "Genre" && !(typeof(req.query["Genre"])=="string")) {
			
			let f = req.query["Genre"].join("&Genre=")
			f = "Genre=" + f;
			params.push(f);
		}else{
			params.push(prop + "=" + req.query[prop]);
		}
	}
	querystring = params.join("&");
	if(req.query.Title && !(req.query.Title === '')) {
		q["Title"] = {$regex: req.query.Title, $options:"$i"}
	}
	if(req.query.Genre) {
		q["Genre"] = {$all: req.query.Genre};
	}
	console.log(q);
	// I have to query the database for the id that matches this, and then should'nt be too bad
	if(req.query.Actor && !(req.query.Actor === '')) {
			let person = await Person.findOne({Name: {$regex: req.query.Actor, $options:"i"}});
			console.log(person);
			if(!person){
				q['Actor'] = '';
			}
			else{
				q['Actors'] = {$in: [person._id]};
			}
		}
	Movie.find(q).skip(start_index).limit(l).exec( function(err,result) {
		if (err) {
			res.status(500).send("Error reading database.");
			return;
		}
		let m ={};
		m.current = Number(req.query.page);
		m.query = querystring;
		console.log(m);
		console.log(result);
		if(req.accepts('html')) {
			res.status(200).render('movies', {movies: result, m:m});
		}
		else if(req.accepts('application/json')) {
			res.status(200).send(JSON.stringify(result));
		}
		
	});
  });

router.post("/", loggedIn,  (req,res) => {
	if(!req.session.Contributing){
		res.status(401).send("Not authorized");
		return;
	}
    let newMovie = req.body;
    console.log("creating new movie");
	console.log(newMovie);
	let newGenre = []
	for(let i =0; i < newMovie.Genre.length; i++) {
		newGenre.push(firstLetterUpperCase(newMovie.Genre[i]));
	}
	newMovie.Genre = newGenre;
	let people = newMovie.Actors.concat(newMovie.Director, newMovie.Writer);
	console.log(people);
	Person.find({Name: {$in: people}}, (err, result)=> {
		if(err) {
			console.log(err);
		}
		let peopleIdMap = createPeopleIdMap(result, newMovie);
		console.log(peopleIdMap);
		let peopleMap = createPeopleMap(result, newMovie);
		console.log(peopleMap);
		newMovie.Actors = peopleIdMap.Actors;
		newMovie.Writer = peopleIdMap.Writer;
		newMovie.Director = peopleIdMap.Director;
		let n = new Movie(newMovie);
		
		n.save((err, result)=>{
			if(err) {
				console.log(err)
			}
			console.log("This is the result"+result);
			console.log("/movies/"+n._id);
			res.status(201).send(JSON.stringify({link:"/movies/"+n._id}));
			updatePeople(peopleMap,n);
			
		})
		
	})
})


async function updatePeople(peopleMap, movie) {
	let actorCount = 0;
	let directorCount = 0;
	let writerCount = 0;
	let updatedFans = false;

	peopleMap.Actors.forEach(actor => {
		actor.Acted.push(movie._id);
		actor.save(function(err,result){
			if(err) {
				console.log(err)
			}
			actorCount+=1;
			if(actorCount >= peopleMap.Actors.length) {
				console.log("actors updated");
				if(actorCount == peopleMap.Actors.length && directorCount == peopleMap.Director.length && writerCount== peopleMap.Writer.length) {
					if(!updatedFans) {
						updatedFans = true;
						notifyFans(peopleMap, movie)
					}
					console.log("Time to update fans");
				}
			}
		})
	});
	peopleMap.Director.forEach(director => {
		director.Directed.push(movie._id);
		director.save(function(err,result){
			if(err) {
				console.log(err)
			}
			directorCount+=1;
			if(directorCount >= peopleMap.Director.length) {
				console.log("directors updated");
				if(actorCount == peopleMap.Actors.length && directorCount == peopleMap.Director.length && writerCount== peopleMap.Writer.length) {
					console.log("Time to update fans");
					if(!updatedFans) {
						updatedFans = true;
						notifyFans(peopleMap, movie)
					}
				}
			}
		})
	});
	peopleMap.Writer.forEach(writer => {
		writer.Wrote.push(movie._id);
		console.log("UPDATED WRITER"+writer);
		writer.save(function(err,result){
			if(err) {
				console.log(err)
			}
			writerCount+=1;
			if(writerCount >= peopleMap.Writer.length) {
				console.log("writers updated");
				if(actorCount == peopleMap.Actors.length && directorCount == peopleMap.Director.length && writerCount== peopleMap.Writer.length) {
					console.log("Time to update fans");
					if(!updatedFans) {
						updatedFans = true;
						notifyFans(peopleMap, movie)
					}
				}
			}
		})
	});
}

async function notifyFans(peopleMap, movie) {
	let actorCount = 0;
	let directorCount = 0;
	let writerCount = 0;
	console.log(peopleMap);

	for(let i = 0; i < peopleMap.Actors.length; i++) {
		let actor = peopleMap.Actors[i];
		let n = {goTo:movie._id, Person:true, Details:"acted in a new movie", Name:actor.Name}
		await actor.Notify(n);
	}
	for(let i = 0; i < peopleMap.Director.length; i++) {
		let actor = peopleMap.Director[i];
		let n = {goTo:movie._id, Person:true, Details:"directed in a new movie", Name:actor.Name}
		await actor.Notify(n);
	}
	for(let i = 0; i < peopleMap.Writer.length; i++) {
		let actor = peopleMap.Writer[i];
		let n = {goTo:movie._id, Person:true, Details:"wrote in a new movie", Name:actor.Name}
		await actor.Notify(n);
	}
	return;

}

function createPeopleIdMap(people, movie) {
	let map = {Actors:[], Director:[], Writer:[]}
	console.log(map);
	for(let i = 0; i < people.length; i++) {
		if(movie.Director.includes(people[i].Name)) {
			map["Director"].push(people[i]._id);
		}
		if(movie.Writer.includes(people[i].Name)) {
			map["Writer"].push(people[i]._id);
		}
		if(movie.Actors.includes(people[i].Name)) {
			map["Actors"].push(people[i]._id);
		}
	}
	return map;
}

function createPeopleMap(people, movie) {
	let map = {Actors:[], Director:[], Writer:[]}
	console.log(map);
	for(let i = 0; i < people.length; i++) {
		if(movie.Director.includes(people[i].Name)) {
			map["Director"].push(people[i]);
		}
		if(movie.Writer.includes(people[i].Name)) {
			map["Writer"].push(people[i]);
		}
		if(movie.Actors.includes(people[i].Name)) {
			map["Actors"].push(people[i]);
		}
	}
	return map;
}


router.get("/:movieId", loggedIn, (req, res) => {
	let oid;
	let value = req.params.movieId;
	console.log("Finding movie by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("User ID " + value + " does not exist.");
		return;
	}
	Movie.findById(value).populate([{path: 'Director',select: 'Name', model: 'Person'}, {path: 'Writer',select: 'Name', model: 'Person'}, {path: 'Actors',select: 'Name', model: 'Person'}, {path: 'Reviews', model: 'Review', populate:[{path: 'userId',select: 'userName', model: 'User'}]},]).exec(function(err, result) {
		if(err){
			res.status(500).send("Internal Database Error");
			return;
		}
		if(!result){
			console.log("Could not find result");
			res.status(404).send("Unknown ID");
			return;
		}
		console.log(result);
		if(result.Reviews.length == 0) {
			result.Rated = "-";
		}
		else{
			let rated = getAverageReviewsRating(result.Reviews);
			result.Rated = rated.toFixed(1);
		}
		Movie.find({"Actors": {$in :result.Actors}, "Title":{$nin: [result.Title]}}).limit(5).exec( (err,r) => {
			if(err){
				res.status(500).send("Internal Database Error");
				return;
			}
			console.log("Similar Movies!: "+r);
			result.similarMovies = r;
			User.findById(req.session.userId, function (err, n) {
				if(err) {
					res.status(500).send("Error reading database");
					return;
				}
				console.log(n);
				if (n.watchList.includes(value)) {
					console.log("watchlist");	
					result.watched = true;
				}
				console.log(result);
				if(req.accepts('html')) {
					res.status(200).render("movie",  {movie: result, session: req.session});
				}
				else if(req.accepts('application/json')) {
					res.status(200).send(JSON.stringify(result));
				}
				return;
			});
		})
	});
  });

function loggedIn(req, res, next) {
		if(!req.session || !req.session.loggedIn) {
			res.redirect('/login');
			return;
		}
		next();
}	

function getAverageReviewsRating(reviews) {
	let m = 0;
	for(let i = 0; i < reviews.length; i++) {
		m += reviews[i].Rating;
	}
	return (m/reviews.length);
}


function firstLetterUpperCase(string) {
	if(string === "") {
		return "";
	}
	if(string.length == 1) {
		return string.charAt(0).toUpperCase();
	}
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;