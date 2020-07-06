var express=require("express"),
    router=express.Router({mergeParams:true});
var item=require("../models/item");
var comment=require("../models/comment");
var middleware=require("../middleware");
//new form for comment
router.get("/new",middleware.isLoggedIn,function(req,res){
    item.findById(req.params.id,function(err,founditem){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{item:founditem});
        }
    })
    
})
//post route of comment
router.post("/",middleware.isLoggedIn,function(req,res){
    item.findById(req.params.id,function(err,item){
        if(err){
            console.log(err);
            res.redirect("/oldroom")
        }else{
            comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error","Something went wrong!")
                    console.log(err);
                }else{
                    //add username and id to comment
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    //save comment
                    comment.save();
                     item.comments.push(comment);
                     item.save();
                     req.flash("success","Successfully added comment!")
                     res.redirect("/oldroom/" + item._id);
                }
            })
        }
    })
});
//edit
router.get("/:comment_id/edit",middleware.checkcommentownership,function(req,res){
    comment.findById(req.params.comment_id,function(err,foundcomment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit",{item_id:req.params.id,comment:foundcomment});
        }
    })
});
//update
router.put("/:comment_id",middleware.checkcommentownership,function(req,res){
    comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatecomment){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Successfully added comment!")
            res.redirect("/oldroom/" + req.params.id);
        }
    })
})
//delete
router.delete("/:comment_id",middleware.checkcommentownership,function(req,res){
    comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Comment deleted!")
            res.redirect("/oldroom/" + req.params.id);
        }
    })
})
module.exports=router;