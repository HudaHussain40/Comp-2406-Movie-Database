const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let notificationSchema = Schema({
	goTo: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	Name: {
		type: String,
		required: true
	},
	Details: {
		type: String,
        required: true
	},
	Person: {
		type: Boolean,
		required: true,
	}
});

//Compile the previously defined schema into a model
//The model is what we will use to work with user documents
//First parameter is a string representing collection name 
// that will be used for this model
//Second parameter is the schema

module.exports = mongoose.model("Notification", notificationSchema);


