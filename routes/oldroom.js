 var express=require("express");
 var router=express.Router();
 var item=require("../models/item");
 var middleware=require("../middleware");
//main page route
router.get("/",function(req,res){
    //get data from DB
    item.find({},function(err,allitems){
        if(err){
            console.log(err);
        } else {
            res.render("items/oldroom",{items:allitems});
        }
    })
   // res.render("oldroom",{items:items});
});
//new item route
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("items/new");
});
//show route
router.get("/:id",function(req,res){
    //find item with provided id
    item.findById(req.params.id).populate("comments").exec(function(err,founditem){
        if(err){
            console.log(err);
        } else{
            res.render("items/show",{item:founditem});
        }
    })
})
//post route
router.post("/",middleware.isLoggedIn,function(req,res){
    //get item from form and add to items array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.desciption;
    var price=req.body.price;
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newitem = {name: name,price:price, image: image,desciption:desc,author:author}
    //create a new item and save it to DB
    item.create(newitem,function(err,item){
        if(err){
            console.log(err);
        } else{
            res.redirect("/oldroom");
        }
    });    
});
//edit
router.get("/:id/edit",middleware.itemownershipcheck,function(req,res){
    item.findById(req.params.id,function(err,itemfound){
        if(err){
            console.log(err);
        }else{
            res.render("items/edit",{item:itemfound});
        }
    })   
})
//update route
router.put("/:id",middleware.itemownershipcheck,function(req,res){
    item.findByIdAndUpdate(req.params.id,req.body.item,function(err,updateditem){
        if(err){
            res.redirect('/oldroom');
        }else{
            res.redirect("/oldroom/" + req.params.id);
        }
    })
})
//delete route
router.delete("/:id",middleware.itemownershipcheck,function(req,res){
    item.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/oldroom");
        }else{
            res.redirect("/oldroom");
        }
    })
})

module.exports = router;