const mongoose = require('mongoose');
const Notification = require("./NotificationModel");
const Movie = require("./MovieModel");

const Schema = mongoose.Schema;

let userSchema = Schema({
	userName: {
		type: String, 
		required: true,
	},
	Password: {
		type: String,
		required: true
	},
	Contributing: {
		type: Boolean,
        required: true
	},
    usersFollowing: [{
        type:Schema.Types.ObjectId, ref:'User'}],
	peopleFollowing: [{
		type:Schema.Types.ObjectId, ref:'Person'}],
    watchList: [{type: Schema.Types.ObjectId, ref:'Movie'}],
	Reviews: [{type: Schema.Types.ObjectId, ref:'Review'}],
    Notifications: [{type: Schema.Types.ObjectId, ref:'Notification'}],
	Followers: [{
        type:Schema.Types.ObjectId, ref:'User'}],
});


userSchema.methods.Recommended = function(callback){
	let m = 0;
	Movie.estimatedDocumentCount((err, result)=>{
		if(err) {
			callback(err);
		}
		console.log(result);
		result = result - 2400;
		let skip = Math.floor(Math.random()*result);
		console.log(skip)
		console.log(this.watchList);
		Genre = [];
		Exclude = [];
		for(let i =0; i < this.watchList.length; i++) {
			Exclude.push(this.watchList[i].Title);
		}
		if(this.watchList.length <= 3) {
			for(let i =0; i < this.watchList.length; i++) {
				console.log(this.watchList[i].Title);
				if(this.watchList[i].Genre.length > 0) {
					Genre.push(this.watchList[i].Genre[0]);
				}
			}
		}
		else {
			for(let i =this.watchList.length-3; i < this.watchList.length; i++) {
				console.log(this.watchList[i].Title);
				if(this.watchList[i].Genre.length > 0) {
					Genre.push(this.watchList[i].Genre[0]);
				}
			}
		}
		console.log(Genre);
		q={};
		if(Genre.length>0) {
			q["Genre"] = {$in: Genre};
		}
		q["Title"] = {$nin: Exclude};
		console.log(q);
		Movie.find(q).skip(skip).limit(5).exec((err, r)=> {
			console.log(r);
			callback(err, r);
		})
	})
};

userSchema.methods.Notify = function(info , callback){
	let m = 0;
	console.log(info);
	if(this.Followers.length == 0) {
		callback();
	}
	for (let i = 0; i < this.Followers.length; i++) {
		n = new Notification(info);
		this.model("User").findById(this.Followers[i], (err, result)=>{
			console.log(result);
			result.Notifications.push(n._id);
			result.save((err)=>{
				if(err) {
					console.log(err);
				}
				n.save((err)=>{
					if(err) {
						console.log(err);
					}
					m+=1;
					console.log(n);
					console.log(result);
					if (m >= this.Followers.length) {
						console.log("ok they got notified");
						callback(err);
					}
				})
			});
		})
	}
};

module.exports = mongoose.model("User", userSchema);


