const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let reviewSchema = Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	reviewText: {
		type: String,
		required: true
	},
	reviewSummary: {
		type: String,
        required: true
	},
    Rating: {
        type: Number,
        required: true
    },
	movieId: {
		type: Schema.Types.ObjectId,
		required: true,
	}
});

//Compile the previously defined schema into a model
//The model is what we will use to work with user documents
//First parameter is a string representing collection name 
// that will be used for this model
//Second parameter is the schema

module.exports = mongoose.model("Review", reviewSchema);


