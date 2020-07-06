var mongoose=require("mongoose");

var itemschema= new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment"
        }
    ]
});

module.exports = mongoose.model("item",itemschema);