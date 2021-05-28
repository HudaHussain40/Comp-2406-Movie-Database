const mongoose = require('mongoose');
const Movie = require('./MovieModel');
const Person = require('./PeopleModel');
const User = require('./UserModel');
const Review = require('./ReviewModel');
const Notification = require('./NotificationModel');
const movies = require('./movie-data-2500.json');
const moviesMongo = {}
const peopleMongo = {}
const usersMongo = {};
const reviewsMongo = {};
const notificationsMongo = {};



let users = [{userName:'Hood20',
    peopleFollowing:["Jon Voight","Faye Dunaway","Flint Dille","Charles Swenson","David Kirschner"],
    usersFollowing:["JelloEater34", 'Suz'],
    watchList:["An American Tail: Fievel Goes West", "The Out-of-Towners"],
    Notifications:[{Person: true, Cause:"Faye Dunaway", Details: "acted in a new movie", goTo: "The Champ"},],
    Reviews:[{reviewSummary:"Really a lovely movie.",reviewText:"A beautiful film, I really enjoyed everything about it. I would give anything to watch it for the first time.",movie: "The Incredible Mr. Limpet" ,Rating:9 }],
    Contributing: false,
    Password: "Bananabus2"
},
{
    userName:'JelloEater34',
    peopleFollowing:["Lindsay Crouse","Joe Mantegna",],
    usersFollowing:['Hood20'],
    watchList:["Dead Poets Society","Woman on Top", ],
    Notifications:[{Person: false, Cause: "Hood20",Details:"made a new review", goTo:"Meh it's ok."}],
    Reviews:[{reviewSummary:"Meh it's ok.",reviewText:"Not great, I have seen better",movie:"Dead Poets Society",Rating:5}],
    Contributing: true,
    Password: "Orange1"
},
{
    userName:'AerdnaNami',
    peopleFollowing:["Sam Weisman","Joe Mantegna",],
    usersFollowing:['Hood20'],
    watchList:["Dead Poets Society","Little Women" ],
    Notifications:[{Person: true, Cause:"Sam Weisman", Details: "directed a new movie", goTo: "The Ballad of Cable Hogue"}],
    Reviews:[{reviewSummary:"I didn't like it",reviewText:"Movie kinda lame tho",movie:"Little Women",Rating:3}],
    Contributing: true,
    Password: "PooPooPeePee123"
},
{
    userName:'Suz',
    peopleFollowing:["Fina Torres","Phil Nibbelink"],
    usersFollowing:['JelloEater34','AerdnaNami'],
    watchList:["House of Games","The Champ" ],
    Notifications:[{Person: false, Cause:"AerdnaNami", Details: "madea new review", goTo: "I didn't like it"}],
    Reviews:[{reviewSummary:"Good Film",reviewText:"Pretty Average but not bad",movie:"House of Games",Rating:7}],
    Contributing: false,
    Password: "Funkymonkey1"
}
]

createMovies();
createUsers();

function createMovies() {
    (movies.forEach(movie => {
    let m = new Movie ({
        Title: movie.Title,
        Year: Number(movie.Year),
        Released: movie.Released,
        Runtime: movie.Runtime,
        Genre: movie.Genre,
        Director:[],
        Writer:[],
        Actors:[],
        Plot: movie.Plot,
        Reviews: [],
        similiarMovies: [],
        Awards: movie.Awards,
        Poster: movie.Poster
    });
    if(moviesMongo.hasOwnProperty(movie.Title)) {
        movie.Title = movie.Title + "( " + movie.Year + " )";
    }
    addPeople(movie, m);
    moviesMongo[movie.Title] = m;
}))}

function addPeople(movie, m) {
    for (let i = 0; i < movie.Actors.length; i++) {
        if (peopleMongo.hasOwnProperty(movie.Actors[i])) {
            peopleMongo[movie.Actors[i]].Acted.push(m._id);
            m.Actors.push(peopleMongo[movie.Actors[i]]._id);
        }
        else {
            let n = newPerson();
            n.Acted.push(m._id);
            n.Name = movie.Actors[i];
            let p = new Person(n);
            peopleMongo[movie.Actors[i]] = p;
            m.Actors.push(p._id);
        }
    }
    for (let i = 0; i < movie.Director.length; i++) {
        if (peopleMongo.hasOwnProperty(movie.Director[i])) {
            peopleMongo[movie.Director[i]].Directed.push(m._id);
            m.Director.push(peopleMongo[movie.Director[i]]._id);
        }
        else {
            let n = newPerson();
            n.Directed.push(m._id);
            n.Name = movie.Director[i];
            let p = new Person(n);
            peopleMongo[movie.Director[i]] = p;
            m.Director.push(p._id);
        }
    }
    for (let i = 0; i < movie.Writer.length; i++) {
        if (peopleMongo.hasOwnProperty(movie.Writer[i])) {
            peopleMongo[movie.Writer[i]].Wrote.push(m._id);
            m.Writer.push(peopleMongo[movie.Writer[i]]._id)
        }
        else {
            let n = newPerson();
            n.Wrote.push(m._id);
            n.Name = movie.Writer[i];
            let p = new Person(n);
            peopleMongo[movie.Writer[i]] = p;
            m.Writer.push(p._id);
    }
}
}

function newPerson() {
    return ({
        Name: '',
        Acted: [],
        Wrote: [],
        Directed: [],
    });
}



function createUsers() {
    for (let i = 0; i < users.length; i++) {
        let n = new User( {
            userName: users[i].userName,
            Password: users[i].Password,
            Contributing: users[i].Contributing,
            Reviews: [],
            Notifications:[],
            watchList:[],
            usersFollowing:[],
            peopleFollowing:[],
            Followers:[],
        });

        for (let j = 0; j < users[i].Reviews.length; j++) {
            let r = new Review( {
                userId: n._id,
                reviewText: users[i].Reviews[j].reviewText,
                reviewSummary: users[i].Reviews[j].reviewSummary,
                Rating: users[i].Reviews[j].Rating,
                movieId: moviesMongo[users[i].Reviews[j].movie]
            })
            reviewsMongo[r.reviewSummary] = r;
            n.Reviews.push(r._id);
            moviesMongo[users[i].Reviews[j].movie].Reviews.push(r._id);
        }
        usersMongo[n.userName] = n;
    }
    for (let i = 0; i < users.length; i++) {

        for (let j = 0; j < users[i].usersFollowing.length; j++) {
            
            let n = users[i].usersFollowing[j];
            usersMongo[users[i].userName].usersFollowing.push(usersMongo[n]._id);
            usersMongo[n].Followers.push(usersMongo[users[i].userName]._id);
            
        }
        for (let j = 0; j < users[i].peopleFollowing.length; j++) {
            let n = users[i].peopleFollowing[j];
            usersMongo[users[i].userName].peopleFollowing.push(peopleMongo[n]._id);
            peopleMongo[n].Followers.push(usersMongo[users[i].userName]._id);
        }
        for (let j = 0; j < users[i].watchList.length; j++) {
            let n = users[i].watchList[j];
            usersMongo[users[i].userName].watchList.push(moviesMongo[n]._id);
        }
        for (let j = 0; j < users[i].Notifications.length; j++) {
            let n = new Notification({
                Details: users[i].Notifications[j].Details,
                Person: users[i].Notifications[j].Person,
            })
            if (users[i].Notifications[j].Person) {
                n.Name = peopleMongo[users[i].Notifications[j].Cause].Name;
                n.goTo = moviesMongo[users[i].Notifications[j].goTo]._id;

            }
            else {
                n.goTo = reviewsMongo[users[i].Notifications[j].goTo]._id;
                n.Name = usersMongo[users[i].Notifications[j].Cause].userName;
            }
            usersMongo[users[i].userName].Notifications.push(n._id);
            notificationsMongo[n._id] = n;
            
        }

    }
}



mongoose.connect('mongodb://localhost:27017/MovieDatabase', {useNewUrlParser:true});
let db = mongoose.connection;


db.on('error', console.error.bind(console, "A connection error has occured"));

db.once('open',function() {
    console.log('connected to movie database');
    mongoose.connection.db.dropDatabase (function(err, result) {
        if (err) {
            console.log("Error dropping data base:");
            console.log(err);
            return;
        }
        console.log("Dropped data base");
        let completedPeople = 0;
        let completedUsers = 0;
        let p = Object.values(peopleMongo);
        let u = Object.values(usersMongo);
        let completedMovies = 0;
        let m = Object.values(moviesMongo);
        let completedReviews = 0;
        let r = Object.values(reviewsMongo);
        let completedNotifs = 0;
        let n = Object.values(notificationsMongo);
		p.forEach(person => {
			person.save(function(err,result){
				if(err) throw err;
				completedPeople++;
				if(completedPeople >= p.length){
					console.log("All people saved.");
                    if(completedPeople >= p.length && completedUsers >= u.length && completedMovies >= m.length && completedReviews >= r.length && completedNotifs >= n.length) {
                        console.log("Finished.");
					    process.exit();
                    }
				}
			})
		});
        
        
		u.forEach(user => {
			user.save(function(err,result){
				if(err) throw err;
				completedUsers++;
				if(completedUsers >= u.length){
					console.log("All Users saved.");
                    if(completedPeople >= p.length && completedUsers >= u.length && completedMovies >= m.length && completedReviews >= r.length && completedNotifs >= n.length) {
                        console.log("Finished.");
					    process.exit();
                    }
                    
				}
			})
		});
 
		m.forEach(movie => {
			movie.save(function(err,result){    
				if(err) {
                    console.log("ERROR"+err);
                }
				completedMovies++;
				if(completedMovies >= m.length){
					console.log("All Movies saved.");
                    if(completedPeople >= p.length && completedUsers >= u.length && completedMovies >= m.length && completedReviews >= r.length && completedNotifs >= n.length) {
                        console.log("Finished.");
					    process.exit();
                    }
				}
			})
		});

		r.forEach(review => {
			review.save(function(err,result){
				if(err) throw err;
				completedReviews++;
				if(completedReviews >= r.length){
					console.log("All Reviews saved.");
                    if(completedPeople >= p.length && completedUsers >= u.length && completedMovies >= m.length && completedReviews >= r.length && completedNotifs >= n.length) {
                        console.log("Finished.");
					    process.exit();
                    }
				}
			})
		});

		n.forEach(notification => {
			notification.save(function(err,result){
				if(err) throw err;
				completedNotifs++;
				if(completedNotifs >= n.length){
					console.log("All Notfications saved.");
                    if(completedPeople >= p.length && completedUsers >= u.length && completedMovies >= m.length && completedReviews >= r.length && completedNotifs >= n.length) {
                        console.log("Finished.");
					    process.exit();
                    }
				}
			})
		});
    })
})
