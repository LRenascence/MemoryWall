var express     = require("express"),
    router      = express.Router(),
    Photo       = require("../models/photo"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware/index.js");

router.get("/photos", function(req, res) {
    Photo.find({}, function(err, photos) {
        if(err){
            console.log(err);
        }
        else{
            res.render("photo/photos", {photos:photos});
        }
    })
});

router.post("/photos", middleware.isLoggedin, function(req, res) {
    var name = req.body.name;
    var image = req.body.img;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPhoto = {name:name, image:image, description:description, author:author};
    //Create a new photo and save to DB
    Photo.create(newPhoto, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        }
        else {
            req.flash("success", "Successfully added a new photo!");
            res.redirect("/photos");
        }
    });
    
});

router.get("/photos/new", middleware.isLoggedin, function(req, res) {
    res.render("photo/new");
})

router.get("/photos/:id", function(req, res) {
    Photo.findById(req.params.id).populate("comments").exec(function(err, foundPhoto) {
        if(err){
            console.log(err);
        }
        else{
            res.render("photo/show", {photo: foundPhoto});
        }
    });
    
});

// Edit photo
router.get("/photos/:id/edit", middleware.checkPhotoOwnership, function(req, res){
    Photo.findById(req.params.id, function(err, foundPhoto){
        res.render("photo/edit", {photo: foundPhoto});
    });
});


// Update photo
router.put("/photos/:id", middleware.checkPhotoOwnership, function(req, res){
    Photo.findByIdAndUpdate(req.params.id, req.body.photo, function(err, updatedPhoto){
        req.flash("success", "Successfully updated photo!");
        res.redirect("/photos/" + req.params.id);
    });
});

// Delete photo
router.delete("/photos/:id", middleware.checkPhotoOwnership, function(req, res){
    Photo.findByIdAndRemove(req.params.id, function(err){
        req.flash("success", "Successfully deleted photo")
        res.redirect("/photos");
    });
});


module.exports = router;