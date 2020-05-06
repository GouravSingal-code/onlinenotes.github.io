const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');

const app = express();

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

//passport config
require('./passport')(passport)

mongoose.connect('mongodb://localhost:27017/gourav' , options );
var db = mongoose.connection;


const client = require('./model/user.js'); 

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Successful!");
});


global.passwordvalue=null;
global.emailvalue=null;
global.name=null;


const port = process.env.PORT || 3000;

//body-parser
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended:false}));

//express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//connect flash
app.use(flash());
// flash is used  for eg we are at registration page and when we complete are registration we want to go to login page with a message say ( successfully registered )  then in this case we use flash message


//global variable
app.use('/' , function(req ,res , next){
    res.locals.error = req.flash('error');  // for flash messages in login page
    // error variable is not equal to null , it is equal to empty string
   // res.locals.emailvalue=null;
    //res.locals.passwordvalue=null;
    next();
})


// view engine setup for node mailer
app.engine('handlebars' , exphbs());
app.set( 'view engine' , 'handlebars' );


// set view engine ejs
app.use(expressLayouts);
app.set("view layout" , "ejs" );
app.set( "view engine" , "ejs" );


// expressvalidator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

  
// session is used to store the value of the current user in the session cookies which you entered into the server by using maps for eg req.session[name]=value , and it will retain in the cookies until you stop the server
// it be just similar to global variables
/*app.get('/session' , function( req , res ){
    
    res.send(req.session);
})

app.get('/session/:name/:value' , function( req , res ){
    var name = req.params.name;
    var value= req.params.value;
    
    req.session[name]=value;
    res.send(req.session[name]);
})
*/

var dir = path.join( __dirname , '../' , 'public')
app.use( express.static( dir ) );



app.use('/' , require('./router/index.js'));





app.post('/register' , async function(req , res){
   emailvalue=null;
   passwordvalue=null;
    
   var newpassword = req.body.password;
   var errors = [];
   var success = null;
   var email= req.body.email;
   var name = req.body.name;
    
   req.checkBody( 'name' , 'Name is Required').notEmpty();
   req.checkBody( 'email' , 'Email is Required').notEmpty();
   req.checkBody( 'password' , 'Password is Required').notEmpty();
   req.checkBody( 'confirm' , 'Confirm is Required').notEmpty();
    
   var error= req.validationErrors();
    
    if(error){
        errors.push({msg:"PLease fill the all Fields "});
    }
    
    if( req.body.password!=req.body.confirm ){
        errors.push({msg:"Password doesnot match "});
    }
    
    if( req.body.password.length < 6 ){
        errors.push({msg:"Password should be at least 6 character"});
    }
    
    // in promise var doenot change its value and array  doenot add value
    // jo karna hai esmai hi karo
    
    client.collection.findOne({email:req.body.email})
    .then(user=>{
        if( user ){
           console.log("email already exist")
           errors.push({msg:"email already registered"});
           res.render('register' , {
               errors,
               email
           });
         
          res.redirect('register');
        }
        
    })
    .catch(err=>
        console.log(err)
    );
    
    if( errors.length > 0 ){
        res.render('register' ,{
            errors,
            email
      })   
    }else{
      var newUser= {
      name:req.body.name,
      email:req.body.email,
      password:req.body.password
    };
    
     try{
      const hashpassword = await bcrypt.hash( req.body.password , 10 );
      newUser.password = hashpassword;  
      console.log(hashpassword);
      console.log(newUser);
     }catch(err){
      res.redirect('/register');   
     }

     client.collection.insertOne(newUser , function(err ){
         if( err ){
             console.log(err);
         }else{
             
         console.log('succesfully registered');   
         let transport = nodemailer.createTransport({
             host:'smtp.aol.com',
             secure:false,
             path:587,
             auth:{
                 service:'aol',
                 user: 'gouravsingal1234', 
                 pass: 'wzqedsmgrjhedltc'
             },
             tls:{
                 rejectUnauthorized:false
             }
         });
         
         let HelperOptions = {
             from:'" GOURAV SINGAL" <gouravsingal1234@aol.com>',
             to:newUser.email,
             subject:'Login Link',
             html: ' <p><a href="http://localhost:3000/login_success">this is the link</a></p> '
         };
             
         transport.sendMail( HelperOptions , (err , info) =>{
             if( err ){
               console.log(err);
               console.log('LAGAE');
               success= "something got wrong";
               res.render('register' , {
                   success:success
               });
             }
             else{
                 console.log('message succesfully sent');
                 emailvalue=req.body.email;
                 passwordvalue=newpassword;
                 success = " Congratulation , You have succesfully registered , you have received an link in your email box! Go and login and Enjoy our notes ! " ;
                res.render('register' , {
                success:success,
                email,
                 name
                 }); 
             }
         });
             

        
        
      }
     

    
});
    
 }
    
});

//login handle
app.post( '/login' , async function(req , res , next){

  emailvalue=null;
  passwordvalue=null;
   
  emailvalue= req.body.email;
  passwordvalue=req.body.password;
  
    
  

  var errors = [];
   req.checkBody( 'email' , 'Email is Required').notEmpty();
   req.checkBody( 'password' , 'Password is Required').notEmpty();
 
    
   var error= req.validationErrors();
    
   if( error ){
       errors.push({msg:"fill all the fields"});
   }
    
  if( errors.length > 0 ){
      res.render('login' , {
          errors
      })
  }
    

    
   passport.authenticate('local' , {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash:true
   })(req , res , next );  
    
    
});

app.post('/forget' , function(req , res ){
      emailvalue=null;
      passwordvalue=null;
      var msg1=null;
      var email = req.body.email;
      emailvalue=email;
      let transport = nodemailer.createTransport({
             host:'smtp.aol.com',
             secure:false,
             path:587,
             auth:{
                 service:'aol',
                 user: 'gouravsingal1234', 
                 pass: 'wzqedsmgrjhedltc' //'cumdyjafxzutsvhl'
             },
             tls:{
                 rejectUnauthorized:false
             }
         });
         
       let HelperOptions = {
             from:'" GOURAV SINGAL" <gouravsingal1234@aol.com>',
             to:req.body.email,
             subject:'Change Password Link',
             html: ' <p><a href="http://localhost:3000/newPassword">Click on this link</a></p> '
       };
             
       transport.sendMail( HelperOptions , (err , info) =>{
             if( err ){
               console.log(err);
               console.log('LAGAE');
               res.redirect('forget')
             }
             else{
                 console.log("succesfully sent");
                 msg1 = "link has been sent to your email! Go to the link and change your password";
                 res.render('forget' , {
                     msg1:msg1,
                     email
                })
             }
         }); 
      })


app.post('/newPassword' , async function(req ,res ){
   var msg2=null;
   passwordvalue=null;
   if( req.body.newp != req.body.newpc ){
       msg2="passwords doenot match";
       res.render('newPassword' , {
           msg2
       });
   }
    
   if( req.body.newp.length < 6 ){
       msg2="password should be atleast 6 characters";
       res.render('newPassword' , {
           msg2
       });
   }
    
   let hashpassword = null;
   try{
    hashpassword = await bcrypt.hash( req.body.newp , 10 );
   }catch(err){
       console.log(err);
   }
    
    
    
    

   client.collection.findOne({email:emailvalue})
   .then( user => {
    console.log(10); 
    if(user){
     try{
      console.log(10);
      console.log(user);
      const newUSER = {
          name:user.name,
          email:user.email,
          password:hashpassword,
          array1:user.array1,
          array:user.array,
          time:user.time
      }
         
      client.collection.deleteOne({email:emailvalue} , function(err){
          if( err){
              emailvalue=null;
              console.log(err);
          }
          else{
            emailvalue=null;
            client.collection.insert( newUSER , function(err){
                if( err ){
                    console.log(err);
                }else{
                    msg2 = "Your password has been updated successfully!";
                    res.render('newPassword' , {
                     msg2
                   });
                }
            })  
          }
      }) 
      }catch(err){
       emailvalue=null;
       res.redirect('/newPassword');   
     } 
        
    }     
   }).catch(err=>{
       console.log(err);
   })
    
    
    
});







app.post('/dashboard' , function(req , res ){

  var box = [];  
  var date = new Date();
  date= date.toString();
  var text = req.body.exampleFormControlTextarea1;
  var value0;
  var value1;
  var value2;
  var x=[];
  

 client.collection.findOne({email:emailvalue})
  .then( user=>{
      
      if( user ){
        client.collection.updateOne({email:emailvalue} , {$addToSet:{"array":text+"~"+date}})
        client.collection.updateOne({email:emailvalue} , {$addToSet:{"time":date}})
      }
      
    
          
       var z={
           value0:text+"~"+date,
           value1:text,
           value2:date,
       }
       
       box.push(z);
    if( user.array!=null ){
      for( i=user.array.length-1 ; i>=0 ; i-- ){
       x=user.array[i].split("~");
        
       var z={
         value0:user.array[i],
         value1:x[0],
         value2:x[1]
       } 
       
       box.push(z);
          
      }
        
    }
        
      
      
      
      res.render('dashboard' , {
          box:box,
          name:user.name.toUpperCase()
      });
        
   }).catch(err=>{
      console.log(err);
   })    
})


app.post('/dashboard2' , function(req , res){
    
    
    if( req.body.data!=null && req.body.delete==null ){
        client.findOne({email:emailvalue})
        .then( user=>{  
         client.aggregate([{"$project":{"index":{"$indexOfArray":["$array" , req.body.data ]}}}])
         .then( user1=>{
            
        var index1;
        var x=0;
        var i=0;
        for(  ; i>-1 ; i++ ){
          if( user1[i]._id.str == user._id.str){
                index1=i;
                break;
            }
        }
    
        
        
        

        var time=user.time[user1[index1].index];
        var fullinfo=user.array[user1[index1].index];
        var fullinfo1 = fullinfo;
        var info1 = fullinfo1.split("~");
        var info = info1[0];
    
        

        client.findOneAndUpdate({"email":emailvalue} , {"$pull": {array:{$in:[fullinfo]}}}, function(err , data){
            console.log(err);
        });

        client.findOneAndUpdate({"email":emailvalue} , {"$pull": {time:{$in:[time]}}} , function(err ,data){
            console.log(err);
        });
             
    
    
         res.render('dashboard2' , {
              info:info,
              name:user.name.toUpperCase()
         })
             
        }).catch(err=>{
                console.log(err);
         })

            
                  
        }).catch(err=>{
            console.log(err);
        })
    }
    
    
    if( req.body.delete!=null && req.body.data==null ){
        
        client.findOne({email:emailvalue})
        .then( user=>{  
            
         if( user.array.length == 0 ){
             res.render('dashboard' , {
                 name:user.name.toUpperCase()
             })
         }
            
        client.aggregate([{"$project":{"index":{"$indexOfArray":["$array" ,req.body.delete ]}}}])
         .then( user1=>{
            
        var index1;
        var x=0;
        var i=0;
        for(  ; i>-1 ; i++ ){
          if( user1[i]._id.str == user._id.str){
                index1=i;
                break;
            }
        }
             
        var time=user.time[user1[index1].index];
        var fullinfo=user.array[user1[index1].index];
  

             

        client.findOneAndUpdate({"email":emailvalue} , {"$pull": {array:{$in:[fullinfo]}}}, function(err , data){
            console.log(err);
        });
   
        client.findOneAndUpdate({"email":emailvalue} , {"$pull": {time:{$in:[time]}}} , function(err , data){
            console.log(err);
        });
             
     var box = [];
     client.findOne({email:emailvalue})
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
                   
        }).catch(err=>{
                console.log(err);
                console.log(1);
        })

                   
        }).catch(err=>{
            console.log(err);
        })   
    }
    
    
});


app.listen( port , ()=> {
    console.log(` listener port : ${port}`);
})                                                