const express = require('express');
const flash=require('connect-flash');
const session = require('express-session');
const router = require('express').Router();
const client = require('../model/user.js');
const path = require('path');


var dir = path.join( __dirname , '../' , 'public')
router.use( express.static( dir ) );


router.get('/' , function( req , res){
    res.render('front');
}); 

router.get('/home' , function(req ,res){
    res.render('welcome');
})
router.get('/welcome' , function(req , res ){
    res.render('welcome');
});

router.get('/register' , function(req , res ){
    res.render('register');
});

router.get('/login_success' , function(req , res ){  
    var success_msg = "Successfully Login";
    res.render('login_success' , {
        success_msg:success_msg
    });
});

router.get('/login' , function(req , res){    
     res.render('login' , {
         passwordvalue,
         emailvalue
     });
});

router.get('/forget' , function(req , res ){
    res.render('forget');
});


router.get('/newPassword' , function(req , res ){
    res.render('newPassword');
});

router.get('/dashboard' , function( req , res){
     var box = [];
     var value0,value1,value2;
     var x=[];
     client.collection.findOne({email:emailvalue})
     .then( user=>{
     
     var i;
     if( user.array==undefined ){
         i=0;
     }else{
     var i=user.array.length-1;
     }
         
     if( user.array!=null ){     
      for( i ; i>=0 ; i-- ){
       x=user.array[i].split('~');
       
       var z={
         value0:user.array[i],
         value1:x[0],
         value2:x[1]
       } 
       
       box.push(z);    
      }
     }
  
      
      res.render('dashboard',{
      name:user.name.toUpperCase(),
      box:box
      })
         
         
      }).catch(err=>{
         console.log(err);
      })   
});

router.get('/profile' , function(req , res){
     client.collection.findOne({email:emailvalue})
     .then( user=>{
        var nameUser=user.name.toUpperCase();
        var emailUser=user.email;
        res.render('profile' , {
         nameUser,
         emailUser,
         name:user.name.toUpperCase()
        })
         
      }).catch(err=>{
         console.log(err);
      })
})

router.get('/dashboard1' , function(req , res ){
      var box = [];
     client.collection.findOne({email:emailvalue})
     .then( user=>{
          if( user.array!=null ){

      for( i=user.array.length-1 ; i>=0 ; i-- ){
       x=user.array[i].split('~');
        
       var z={
         value0:user.array[i],
         value1:x[0],
         value2:x[1]
       } 
       
       box.push(z);
          
      }
        
      }
      
      res.render('dashboard1' , {
      name:user.name.toUpperCase(),
      box:box  
      })
         
      }).catch(err=>{
         console.log(err);
      })   
})

router.get('/help' , function(req , res ){
    res.render('help');
})

router.get('/contact' , function(req , res ){
    res.render('contact');
})

module.exports = router;