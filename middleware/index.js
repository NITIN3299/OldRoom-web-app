var item=require('../models/item');
var comment=require('../models/comment')
var middlewareobj={};

middlewareobj.itemownershipcheck=function(req,res,next) {
    if(req.isAuthenticated()){
        item.findById(req.params.id,function(err,founditem){
            if(err){
                req.flash("error","ERROR 404!")
                res.redirect("back")
            }else{
                if(founditem.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that!")
                    res.redirect("back");
                }
            }
        })
  }else{
      req.flash("error","You don't have permission to do that!")
      res.redirect('back'); 
  }
};
middlewareobj.checkcommentownership=function(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err,foundcomment){
            if(err){
                res.redirect("back")
            }else{
                if(foundcomment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that!")
                    res.redirect("back");
                }
            }
        })
  }else{
    req.flash("error","You don't have permission to do that!")
      res.redirect('back'); 
  }
}
middlewareobj.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","you need to be logged in!")
    res.redirect('/login');
}
module.exports = middlewareobj;
