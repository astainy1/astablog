// import node modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require('path');
const saltRounds = 12;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { body, validationResult } = require("express-validator");
const multer = require('multer');

const db = require("../config/db");
const isAuth = require("../middlewares/isLoggedIn");

// Middleware to protect admin routes
const isAdmin = require("../middlewares/isLoggedIn");


const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb){
            cb(null, 'public/uploads/profile');
        },
        filename: function (req, file, cb) {
            // cb(null, Date.now() + path.extname(file.originalname)); 
            cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
        }
    })
});


/*
    Default home pages.
    These pages will be rendered for users who have not logged-in to the platform.

*/

// Default page: home get routes
router.get("/", (req, res) => {
  res.render("default/index", { title: "Home | astablog" });
});

/*
    Logged-in user pages.
    These pages will be rendered for users who have logged-in to the platform.

*/

// Logged-in page: Home routes
router.get("/home", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;
//   console.log("Is Admin: ", userName.isAdmin);
  //   console.log("userName", userName);
  res.render("user/home", {
    title: "Home | astablog",
    userInfo: userName.username,
  });
});

// Logged-in page: Profile routes
router.get("/user/profile", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;

  //Retrive all user details from database
  const userDetails = `SELECT full_name, username, email, profile_picture, bio, location FROM users WHERE id = ?`;
  db.query(userDetails, [userName.id], (err, result) => {
    if (err) {
      console.error("Error retriving user data from database: ", err.message);
      req.flash("error", "Something went wrong. Please try again.");
      req.flash("error", "Something went wrong. Please try again.");
      return res.redirect(303, "/user/profile");
    } else {
    //   console.log("User details retrieved", result);

      res.render("user/profile", {
        title: "Profile | astablog",
        userInfo: userName.username,
        userDetail: result,
        message: req.flash("error"),
      });
      return;
    }
  });
});

// Logged-in page: Edit Profile routes
router.get("/edit/profile", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;
  

  //Populate user details in the respective fields
  const getAllUserDetails = `SELECT profile_picture, username, full_name, location, bio FROM users WHERE id = ?`;

  db.query(getAllUserDetails, [userName.id], (err, results) => {
    if(err){
        console.error('Error retrieving user details: ' + err.message); 
        res.redirect(303, '/user/profile');
    }else{
        console.log(results[0]);
        const dbResults = results[0];

        res.render("user/editprofile", {
            title: "Edit Profile | astablog",
            userInfo: userName.username,
            message: req.flash("error"), userDetails: dbResults,
          });
    }
  })

});

router.post("/edit/profile", isAuth.isLoggedIn, upload.single('profilePhoto'), (req, res, next) => {

    //Get user details from request body
    const userID = req.session.userFound;
    const loggedUserID = userID.id;
    // console.log(userID);
    // console.log(userID.profilePicture);
    const profilePhoto = req.file;
    const profilePhotoURL = profilePhoto ? profilePhoto.filename : userID.profilePicture;
    
    // console.log(profilePhoto);
  const {username, full_name, facebookID, twitterID, profilemail, location, bio} = req.body;

  //console.log(username, full_name, location, bio, userID)

  const updateUserProfile = `UPDATE users SET profile_picture = ?, username = ?, full_name = ?, location = ?, bio = ? WHERE id = ?`;
  db.query(updateUserProfile, [profilePhotoURL, username, full_name, location, bio, loggedUserID], (err, result) => {
    if(err) {
        console.error('Error updating user profile: ' + err.message);
        req.flash('error', 'Error updating profile. Please try again.');
        res.redirect(303, '/edit/profile');
    }else{

      if(!result.length === 0){
        // console.log('User profile updated ', result);
        res.redirect(303, "/user/profile");
      }else{
        console.log('Duplicate data')
      }

    }
  });
});

// Logged-in page: Write Article routes
router.get("/create/article", isAuth.isLoggedIn, (req, res) => {
  res.render("user/createarticle", { title: "Write Article | astablog" });
});

router.post("/create/article", isAuth.isLoggedIn, (req, res) => {
  res.redirect(303, "/article");
});

//Logged-in page: Read Article
router.get('/post', isAuth.isLoggedIn, (req, res) => {
    const userName = req.session.userFound;
    
    res.render('user/post', {title: 'Article | astablog ', userInfo: userName.username});

});



//Admin page
router.get("/asta-admin", isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard | astablog" });
});

router.get(
  "/asta-admin/articles",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    res.render("admin/article", { title: "Admin Article List | astaBlog" });
  }
);

module.exports = router;
