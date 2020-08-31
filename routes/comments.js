var express     = require("express"),
    router      = express.Router(),
    Photo  = require("../models/photo"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware/index.js");

router.get("/photos/:id/comments/new", middleware.isLoggedin, function(req, res) {
    Photo.findById(req.params.id, function(err, foundPhoto) {
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new", {photo: foundPhoto});
        }
    });
});

router.post("/photos/:id/comments",middleware.isLoggedin, function(req, res) {
    Photo.findById(req.params.id, function(err, foundPhoto) {
        if(err){
            req.flash("error", err.message);
            res.redirect("/photos");
        }
        else{
            Comment.create(req.body.comment, function(err, newComment) {
                if(err){
                    console.log(err);
                }
                else{
                    //add username and id to comment
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    //save comment
                    newComment.save();
                    foundPhoto.comments.push(newComment);
                    foundPhoto.save();
                    req.flash("success", "Successfully added a new comment");
                    res.render("/photos/" + foundPhoto._id);
                }
            });
        }
    });
});

// edit comment
router.get("/photos/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        res.render("comments/edit", {photo_id:req.params.id, comment: foundComment});
    });
});
// update comment
router.put("/photos/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        req.flash("success", "Successfully updated comment");
        res.redirect("/photos/" + req.params.id);
    });
});
// delete comment
router.delete("/photos/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        req.flash("success", "Successfully deleted comment");
        res.redirect("/photos/" + req.params.id);
    });
});


module.exports = router;