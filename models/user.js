var mongoose=require('mongoose');
var passportlm=require('passport-local-mongoose');

var userschema=new mongoose.Schema({
    username:String,
    password:String
});
userschema.plugin(passportlm);
module.exports=mongoose.model("user",userschema);
