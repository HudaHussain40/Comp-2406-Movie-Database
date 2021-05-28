const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let movieSchema = Schema({
	Title: {
		type: String, 
		required: true,
	},
	Year: {
		type: Number,
		required: true
	},
	Released: {
		type: String,
        required: true
	},
    Runtime: {
        type: String,
        required: true 
    },
	Genre: [String],
    Director: [{type: Schema.Types.ObjectId, ref:'Person'}],
    Writer: [{type: Schema.Types.ObjectId, ref:'Person'}],
    Actors: [{type: Schema.Types.ObjectId, ref:'Person}'}],
	Reviews: [{type: Schema.Types.ObjectId, ref:'Review'}],
    Plot: {
        type: String,
        required: true
    },

    Awards: {
        type: String,

    },
    Poster: {
        type:String
    }
});

//Compile the previously defined schema into a model
//The model is what we will use to work with user documents
//First parameter is a string representing collection name 
// that will be used for this model
//Second parameter is the schema

module.exports = mongoose.model("Movie", movieSchema);


