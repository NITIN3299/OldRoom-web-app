var express=require("express"),
    router=express.Router();
var passport=require("passport");
var user=require("../models/user");
router.get("/",function(req,res){
    res.render("landing");
});
//show register form
router.get("/register",function(req,res){
    res.render('register');
});
//handle sign up logic
router.post("/register",function(req,res){
    var newuser=new user({username:req.body.username});
    user.register(newuser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to OldRoom " + user.username);
            res.redirect('/oldroom');
        })
    })
});
//login route
router.get('/login',function(req,res){
    res.render('login');
})
//handle login logic
router.post("/login",passport.authenticate('local',{
    successRedirect:"/oldroom",
    failureRedirect:"/login"
}),function(req,res){
});
//logout 
router.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Logged You Out!!");
    res.redirect("/oldroom");
});


module.exports = router;