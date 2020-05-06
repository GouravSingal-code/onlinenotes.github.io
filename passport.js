const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


// load user model
const client  = require('./model/user.js');
//done is a callback
module.exports = function(passport){
    passport.use(
     new LocalStrategy({ usernameField: 'email'} , ( email , password , done ) =>{
         //match user
         
         client.collection.findOne({email : email})
         .then( user =>{
             if( !user ){
               return done( null , false , { message:"email not registerd"} ); 
             }
             
             //match password 
             
           bcrypt.compare( password , user.password , (err , isMatch)=>{
             if( err ) throw err;
            
             if( isMatch ){
                 return done( null , user );
             }
               else{
                   return done ( null , false , {message : "password incorrect"});
               }
           });
             
         })
         .catch(err => {
             console.log(err);
         })
         
     })
    
    
    
    );

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
    
/*
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, client) {
    done(err, user);
  });
});
*/
    
}


