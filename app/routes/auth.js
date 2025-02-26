// import express framework and instantiate it
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require('fs');
const multer = require('multer');
const db = require("../config/db");
const saltRounds = 12;
const isAuth = require('../middlewares/isLoggedIn');
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
const { body, validationResult } = require("express-validator");

const profileUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb){
            cb(null, 'public/uploads/profile/admin');
        },
        filename: function (req, file, cb) {
            // cb(null, Date.now() + path.extname(file.originalname)); 
            cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
        }
    })
});

//Default page: Login routes
router.get("/login", (req, res) => {

  res.render("default/login", {
    title: "Login | astablog",
    message: req.flash("error"),
  });

});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {

    // console.log("Please enter your email address and password");
    req.flash("error", "Email and password are required.");
    res.redirect(303, "/login");

  }

  // Check if user exist in the database
  const getAllUsers = `SELECT * FROM users WHERE email = ?`;
  db.query(getAllUsers, [email], (err, rows) => {
    if (err) {

      console.error("Error retrieving users from database: ", err.message);
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect(303, "/login");

    } else {

      if (rows.length === 0) {
        console.log("No users found");
        req.flash("error", "User does not exist.");
        res.redirect("/login");
        return;

      }

      //Get user information from database result
      const userID = rows[0];

      //Compare encrypted password with plain password
      bcrypt.compare(password, userID.password, (err, validPassword) => {
        if (err) {

          console.error(`Error comparing passwords: ${err.message}`);
          req.flash("error", "Something went wrong. Please try again.");
          return res.redirect(303, "/login?error=Password%20error");

        }

        if (validPassword) {
          // console.log(userID.is_admin);
            // Check if logged-in user is an Admin or regular user

            // Check is user is Admin
          if (userID.is_admin === 1) {

            req.session.userFound = {
              id: userID.id,
              username: userID.username,
              email: userID.email,
              isAdmin: userID.is_admin,
              profilePicture: userID.profile_picture
            };

            // console.log(`User ${userID.username} has successfully logged in!`);

            // console.log('Is Admin: ', userID.is_admin);
            // console.log(`User details: ${userID.profile_picture} `);

            req.flash("success", "You have successfully logged in!");
            res.redirect(303, "/asta-admin");

          } else {
            // Else user is regular user
            req.session.userFound = {
              id: userID.id,
              username: userID.username,
              email: userID.email,
              isAdmin: userID.is_admin,
              profilePicture: userID.profile_picture
            };

            // console.log(`User ${userID.username} has successfully logged in!`);
            // console.log('Is Admin: ', userID.is_admin);
            // console.log(`User details: ${userID.profile_picture} `);

            req.flash("success", "You have successfully logged in!");
            res.redirect(303, "/home");

          }
        } else {
          req.flash("error", "Incorrect password.");
          res.redirect(303, "/login?error=Incorrect%20password");
        }
      });
    }
  });
});

//Default page: Register routes
router.get("/register", (req, res) => {
  res.render("default/register", {
    title: "Register | astablog",
    message: req.flash("error"),
  });
});

router.post(
  "/register",
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  (req, res) => {
    //Throw an error if there exists any.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      req.flash("error", errorMessages.join(" | "));
      return res.redirect(303, "/register");
    }

    const { username, email, password, registercheckbox } = req.body;
    // console.log(username, email, password, registercheckbox);

    //Check if user exits
    const existantUser = `SELECT * FROM users WHERE email = ? OR username = ?`;

    db.query(existantUser, [email, username], (err, result) => {
      // console.log('Result from database: ', result[0].id);
      if (err) {
        console.error(err.message);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect(303, "/register");
      } else {
        if (result.length > 0) {
          console.log("Username or email already exists.");
          req.flash("error", "Username or email already exits.");
          return res.redirect(
            303,
            "/register?error=username%20or%20email%20already%20exists"
          );
        } else {
          // Hash user password
          bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
              console.log("Error Hashing user password.");
              req.flash("error", "Something went wrong. Please try again");
              res.redirect(303, "/register");
              return;
            } else {
              // const isAdmin = true; //fleg to register admin
              const hashPassword = hash;
              const insertQuery = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;

              db.query(
                insertQuery,
                [username, email, hashPassword],
                (err, result) => {
                  if (err) {
                    console.log(
                      "Error inserting data into database: ",
                      err.stack
                    );
                    req.flash(
                      "error",
                      "Something went wrong. Please try again"
                    );
                    res.redirect(303, "/register");
                    return;
                  } else {
                    console.log(result);
                    // if(!row){

                    // }
                    res.redirect(303, "/login");
                  }
                }
              );
            }
          });
        }
      }
    });
  }
);

// Default page: Password Reset routes
router.get("/reset", (req, res) => {
  res.render("default/recoveraccount", {
    title: "Reset Password | astablog",
    message: req.flash("error"),
  });
});

router.post("/reset", (req, res) => {
  // Logic for authenticating user email for password reset
  const { email } = req.body;
  // console.log(email);


  const queryConfirmEmail = `SELECT * FROM users WHERE email = ?`;

  db.query(queryConfirmEmail, [email], (err, rows) => {
    if (err) {
      console.error("Error retrieving email for confirmation: ", err.message);
    } else {
      if (!rows.length > 0) {
        console.log("Email not found");
        req.flash("error", "User not found");
        return res.redirect("/reset?error=user%20not%20found");
      } else {
        const userFoundEmail = rows[0];
        req.session.userFound = {
            id: userFoundEmail.id,
            username: userFoundEmail.username,
            email: userFoundEmail.email,
          };

        console.log("Email found with username: ", rows[0].username);
        return res.redirect(303, "/new/password");
      }
    }
  });
});

// Default page: New Password Routes
router.get("/new/password", (req, res) => {
  res.render("default/resetpassword", {
    title: "New Password | astablog",
    message: req.flash("error"),
  });
});

router.post("/new/password", (req, res) => {
  const { password, confirm_password } = req.body;
  const userID = req.session.userFound.id

//   console.log(userID);
//   console.log(password, confirm_password);

  if (password === confirm_password) {
    // console.log("Password match");

        //Hash current password
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            console.error("Error hashing new password");
            req.flash("error", "Something went wront. Please try again.");
            return res.redirect(303, "/new/password");
          } else {
            console.log("Password is hashed: ", hash);

            // Update old password with new hashed password
            const newPasswordQuery = `UPDATE users SET password = ? WHERE id = ?`;

            db.query(newPasswordQuery, [hash, userID], (err, result) => {
                if(err){
                    console.error("Error updating user password");
                    req.flash('error', 'Something went wrong. Please try again');
                    return redirect(303, '/new/password');
                }else{
                    console.log("User password updated successfully");
                    return res.redirect(303, "/login");
                }
            });
          }
        });

  } else {
    console.log("Password not matched!");
    req.flash("error", "Password does not match");
    res.redirect(303, "/new/password?error=password%20not%20matched");
  }
});

// Admin Section Routes
router.get('/asta-admin/profile', isAuth.isLoggedIn, (req, res) => {


    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }
        // console.log(result);
        res.render("admin/profile", {
          title:  "Admin Profile | astablog",
          userInfo: result[0],
          userDetails: userID.username,
        });
      })
  
});

router.post('/asta-admin/profile', isAuth.isLoggedIn, (req, res) => {
  res.redirect(303, '/asta-admin/editprofile');
});

router.get('/asta-admin/editprofile', isAuth.isLoggedIn, (req, res) => {

   // Get user id stored in session
   const userID = req.session.userFound;

   // console.log('Admin ID: ', userID);
   // Get user details from database
   const userDetails = `SELECT * FROM users WHERE id = ?`;
   db.query(userDetails, [userID.id], (err, result) => {
     if (err) {
       console.error("Error fetching user details:", err.stack || err);
       return res.status(500);
     }

     
       // console.log(result);
       res.render("admin/editprofile", {
         title:  "Edit profile | astablog",
         userInfo: result[0],
       });
     })

})

router.post('/asta-admin/editprofile', isAuth.isLoggedIn, profileUpload.single('profileimge'), (req, res) => {

  // Get user id stored in session
  const userID = req.session.userFound;

  //Get Admin profile picture 
  const profileimge = req.file;
  const adminProfilePicture = profileimge ? req.file.filename : userID.profilePicture;

  //Get profile details
  const {email, username, fullname, address} = req.body;
  
  // console.log('Profile Details: ', email, username, fullname, address);
  // console.log('Profile Image: ', adminProfilePicture);

  //Insert admin info into users table
  const adminInfoSertion = `UPDATE users SET email = ?, username = ?, full_name = ?, location = ?, profile_picture = ? WHERE id = ?`;

  db.query(adminInfoSertion, [email, username, fullname, address, adminProfilePicture, userID.id], (err, rows) => {
    if(err){
      console.error('Error inserting data into user table: ', err.stack || err.message);
      res.status(500);
      return;
    }
    console.log(`User ${userID.username} has successfully updated his profile `);
    res.redirect(303, '/asta-admin/profile');

  })

})

// Logout route
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session.");
      res.redirect("/home");
    } else {
      res.redirect("/");
    }
  });
});

//Export router
module.exports = router;
