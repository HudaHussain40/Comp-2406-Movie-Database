const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Movie = require("./MovieModel");
const Notification = require("./NotificationModel");
const USer = require("./UserModel");

let peopleSchema = Schema({
	Name: {
		type: String, 
		required: true,
	},
    Acted: [{type: Schema.Types.ObjectId, ref:'Movie'}],
    Directed: [{type: Schema.Types.ObjectId, ref:'Movie'}],
    Wrote: [{type: Schema.Types.ObjectId, ref:'Movie'}],
    Followers: [{type: Schema.Types.ObjectId, ref:'User'}]
});

//Compile the previously defined schema into a model
//The model is what we will use to work with user documents
//First parameter is a string representing collection name 
// that will be used for this model
//Second parameter is the schema

peopleSchema.methods.getFrequentCollabs = function(callback) {
    
    this.populate([{path: 'Directed', model: 'Movie'}, {path: 'Wrote', model: 'Movie'}, {path: 'Acted', model: 'Movie'}],(err, result)=> {
        console.log("THIS IS THE RESULT",result);
        let n = {};
        for(let i = 0; i < result.Directed.length; i++) {
            n = countPeople(n, result.Directed[i]);
            console.log(n);
        }
        for(let i = 0; i < result.Wrote.length; i++) {
            n = countPeople(n, result.Wrote[i]);
        }
        console.log("Checking acted");
        console.log(result.Acted);
        for(let i = 0; i < result.Acted.length; i++) {
            n = countPeople(n, result.Acted[i]);
        }
        console.log("THIS IS N:"+n);
        console.log(n);
        let m = Object.keys(n);
        let s = [];
        for (let i = 0; i < m.length; i++) {
            if(m[i] != this._id) {
            s.push(n[m[i]]);
            }
        }
        console.log(s);
        s.sort(function(a, b){
            return b.collabs - a.collabs;
        });
        if(s.length > 5) {
            s = s.splice(0,5);
        } 
        let q = [];
        for(let i = 0; i < s.length; i++) {
            q.push(s[i].id);
        }
        this.model("Person").find({_id:{ $in:q}}, (err, r)=> {
            if(err) {
                console.log(err);
            }
            callback(err,r);
        });
    })
}

function countPeople(n, movie) {
    console.log("IN function");
    for(let j = 0; j < movie.Director.length; j++) {
        if(!n.hasOwnProperty(movie.Director[j])) {
            n[movie.Director[j]] = {id: movie.Director[j], collabs: 1};
            console.log(n);
        }
        else {
            n[movie.Director[j]].collabs += 1;
        }
    }
    for(let j = 0; j < movie.Writer.length; j++) {
        if(!n.hasOwnProperty(movie.Writer[j])) {
            n[movie.Writer[j]] = {id: movie.Writer[j], collabs: 1};
        }
        else {
            n[movie.Writer[j]].collabs +=1;
        }
    }
    for(let j = 0; j < movie.Actors.length; j++) {
        if(!n.hasOwnProperty(movie.Actors[j])) {
            n[movie.Actors[j]] = {id: movie.Actors[j], collabs: 1};
        }
        else {
            n[movie.Actors[j]].collabs +=1;
        }
    }
    return n;

}

peopleSchema.methods.Notify = async function(info){
	let m = 0;
    if(this.Followers.length == 0) {
		return;
	}
	for (let i = 0; i < this.Followers.length; i++) {
		n = new Notification(info);
		let result = await this.model("User").findById(this.Followers[i]);
		result.Notifications.push(n._id);
		await result.save();
		await n.save();
		}
    return;
    }





module.exports = mongoose.model("Person", peopleSchema);
