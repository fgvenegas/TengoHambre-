// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var UserSchemaNew = new Schema({
    username: {type: String, required: true},
    products: {type: String, required: true},
    price: {type: String, required: true},
    phone: {type: Number, required: true},
    location: {type: [Number], required: true}, // [Long, Lat]
    place: {type: String, required: true},
    duration: {type: String, required: true},
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
UserSchemaNew.index({location: '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('scotch-user', UserSchemaNew);
