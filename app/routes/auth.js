// import express framework and instantiate it
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const path = require("path");
const fs = require('fs');
const nodemailer = require("nodemailer");
const multer = require('multer');
const db = require("../config/db");
const saltRounds = 12;
const isAuth = require('../middlewares/isLoggedIn');
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

// Configure transporter (using my google SMTP credentials)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "astablog0@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // debug: true,
  // logger: true,
});

console.log("App Password Loaded:", process.env.APP_PASSWORD ? "Yes" : "No");

//Verify transporter configuration 
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("SMTP Connection Error:", error.stack);
//   } else {
//     console.log("SMTP Connection Success:", success);
//   }
// });

//Default page: Login routes
router.get("/login", (req, res) => {

  const error = req.flash("error");
  const success = req.flash("success");
  

  res.render("default/login", {
    title: "Login | astablog",
    errorMessage: error[0],
    successMessage: success[0],
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
  const error = req.flash("error");
  const success = req.flash("success");

  // errorMessage: error[0],
  // successMessage: success[0],
  
  res.render("default/register", {
    title: "Register | astablog",
    errorMessage: error[0],
    successMessage: success[0],
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
  const error = req.flash("error");
  const success = req.flash("success");
  
  // console.log("Error message: ", req.flash("error"));
  // console.log("Success message: ", req.flash("success"));

  res.render("default/recoveraccount", {
    title: "Reset Password | astablog",
    errorMessage: error[0],
    successMessage: success[0],
  });
});


router.post("/reset", (req, res) => {
  const { email } = req.body;
  console.log(email + ' Is changing his password.')
  const queryConfirmEmail = `SELECT * FROM users WHERE email = ?`;

  db.query(queryConfirmEmail, [email], (err, rows) => {
    if (err) {
      console.error("Error retrieving email: ", err.message);
      req.flash("error", "Something went wrong. Please try again.");
      return res.redirect("/reset");
    } 

    if (rows.length === 0) {
      console.log("Email not found");
      req.flash("error", "User not found");
      return res.redirect("/reset?error=user%20not%20found");
    } 
    
    const user = rows[0];

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

     const tokenExpiration = new Date((Math.floor(Date.now() / 1000) + 30 * 60) * 1000); // 30 minutes from now in milliseconds

    const resetTokenExpiryFormatted = tokenExpiration.toISOString().slice(0, 19).replace('T', ' '); // Convert to "YYYY-MM-DD HH:MM:SS" format


    const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`;

    db.query(updateQuery, [resetToken, resetTokenExpiryFormatted, email], (err) => {
      if (err) {
        console.error("Error storing reset token:", err.message);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/reset");
      }

      console.log("Reset token generated:", resetToken);

      const resetLink = `http://localhost:5000/new/password?token=${encodeURIComponent(resetToken)}`;
      

      // Send email
    const mailOptions = {
      from: '"Asta Blog" <noreply.asta@blog.org>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 30 minutes.</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err.message);
        req.flash("error", "Error sending email. Please try again.");
        return res.redirect("/reset");
      }

      console.log("Password reset email sent:", info.response);
      // Inform the user the reset link has been sent
      req.flash("success", "A link to reset your password has been sent to your email address.");
     // Redirect to the confirmation page
      return res.redirect("/reset-sent");
    });
      // Redirect user to reset password page with token
      // return res.redirect(`/new/password?token=${resetToken}`);
    });
  });
});

// Route to show a confirmation page after the reset link is sent
router.get("/reset-sent", (req, res) => {
  res.render("default/passwordlink", {
    title: "Password Reset Link | astablog",
    message: req.flash("success") // Display success message
  });
});


// Default page: New Password Routes
router.get("/new/password", (req, res) => {

  const error = req.flash("error");
  const success = req.flash("success");

  // errorMessage: error[0],
  // successMessage: success[0],
  res.render("default/resetpassword", {
    title: "New Password | astablog",
    errorMessage: error[0],
    successMessage: success[0],
  });
});

router.post("/new/password", (req, res) => {
  const { password, confirm_password } = req.body;
  const myToken = req.query.token; // Get token from the URL query

  console.log('Token from the request URL: ' + myToken); // Debug: Log the token

  // If no token is found, redirect with an error
  if (!myToken) {
    req.flash("error", "Invalid or expired token.");
    return res.redirect("/reset");
  }

  // Check if token exists in the database and is not expired
  const query = `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()`;

  db.query(query, [myToken], (err, rows) => {
    if (err) {
      console.error("Error verifying reset token:", err.message);
      req.flash("error", "Something went wrong. Please try again.");
      return res.redirect("/reset");
    }

    console.log("Token expiry time:", rows[0].reset_token_expiry);
    console.log("Token creation time:", rows[0].reset_token);
    console.log("Current time:", new Date());

    // If no matching token, show error
    if (rows.length === 0) {
      console.log(rows)
      console.log('No matching token.')
      req.flash("error", "Invalid or expired reset token.");
      return res.redirect("/reset");
    }

    const user = rows[0];
    // Get current time in seconds (UTC)
    const currentTime = Math.floor(Date.now() / 1000);  

     // Check if the token has expired (comparing with stored expiration time)
     if (user.reset_token_expiry < currentTime) {
      console.log('This token has expired.')
      req.flash("error", "Token has expired.");
      return res.redirect("/reset");
    }

    // ✅ Check if passwords match
    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/new/password?token=${myToken}&error=password%20not%20matched`);
    }

    // ✅ Hash new password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err.message);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect(`/new/password?token=${myToken}`);
      }

      // ✅ Update password in database
      const updatePasswordQuery = `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`;

      db.query(updatePasswordQuery, [hash, user.id], (err) => {
        if (err) {
          console.error("Error updating password:", err.message);
          req.flash("error", "Something went wrong. Please try again.");
          return res.redirect(`/new/password?token=${myToken}`);
        }

        console.log("User password updated successfully.");
        req.flash("success", "Password reset successfully. You can now log in.");
        return res.redirect("/login");
      });
    });
  });
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
