var express=require("express");
var mongoose=require("mongoose");
var passport=require('passport'),
    localstrategy=require('passport-local'),
    passportlm=require('passport-local-mongoose');
var user=require("./models/user");
var app=express(); 
var flash=require("connect-flash");
var bodyparser = require("body-parser");
var methodoverride=require("method-override");
var comment=require('./models/comment');
var item=require("./models/item");
var seedDB=require("./seed");

var commentroutes=require("./routes/comments"),
    oldroomroutes=require("./routes/oldroom"),
    authroutes=require("./routes/auth");
app.use(bodyparser.urlencoded({extended: true}));
app.use(flash());
app.set("view engine","ejs");
//mongoose.connect("mongodb://localhost:27017/oldroom_app_v2",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connect("mongodb+srv://nitin:nitinpass@cluster0.8ry5g.mongodb.net/oldroom?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});
//mongodb+srv://nitin:<password>@cluster0.8ry5g.mongodb.net/<dbname>?retryWrites=true&w=majority
app.use(methodoverride("_method"))
app.use(express.static(__dirname + "/public"));
//seedDB();

//passport configuration
app.use(require('express-session')({
    secret:"Once again Rusty wins cutest dog!",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentuser = req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});
app.use("/",authroutes);
app.use("/oldroom",oldroomroutes);
app.use("/oldroom/:id/comments",commentroutes);

app.listen(3000,function(){
    console.log("OLDROOM IS STARTING....");
});