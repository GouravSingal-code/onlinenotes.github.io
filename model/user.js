const mongoose = require('mongoose');

var userSchema =  mongoose.Schema({
    name:String,
    email:String,
    password:String,
    array:[],
    time:[]
    
});
var client = mongoose.model('client' , userSchema , 'client');

module.exports = client;


// create a model 
// model for our user