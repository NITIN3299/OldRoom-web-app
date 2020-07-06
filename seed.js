var mongoose=require("mongoose");
var item=require("./models/item");
var comment=require("./models/comment");

var data = [
    {
        name: "Fortuner",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTPSNnwgGtCLvnsUG2gXYj4-ilUWQtptqj2aFZCjZTQQsFJscNb&usqp=CAU",
        description:"blah blaj blah"
    },
    {
        name: "Scorpio",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ7-imu3YhvuEaqmpCuIXBf2rtDcWCoOodOffYUcDfeQFD8BJXC&usqp=CAU",
        description:"blah balh"
    },
    {
        name:"Bajaj Chetak",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTSMWLCXCI-KLguUg2dWn_RPO3GRUdDASWegzMmEZBaokYbIldY&usqp=CAU",
        description:"blahbalhablh"
    }
]
function seedDB(){
    //remove all items
    item.remove({},function(err){
        if(err){
            console.log(err);
        }
        console.log("items.removed");
       data.forEach(function(seed){
           item.create(seed,function(err,item){
               if(err){
                   console.log(err);
               } else{
                   console.log("added an item");
                   // create a comment 
                   comment.create(
                       {
                           text:"which model?,thik thik lgale bhai..",
                           author:"Homer"
                       },function(err,comment){
                           if(err){
                               console.log(err);
                           }else{
                               item.comments.push(comment);
                               item.save();
                               console.log("created new comment");
                           }
                       }
                   )
               }
           })
       })
    });
    comment.remove({},function(err){
        if(err){
            console.log(err);
        }
        console.log("comments removed");
    })
}

module.exports = seedDB;