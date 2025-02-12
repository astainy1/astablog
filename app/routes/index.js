// import express framework and instantiate it
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const saltRounds = 12;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { body, validationResult } = require('express-validator');
const isAuth = require('../middlewares/isLoggedIn');


//Configure passport
// passport.use(new LocalStrategy (function varify(email, password, cb){
    
//     const getQuery = `SELECT * FROM user WHERE email = ?`;
//     db.query(getQuery, [email], function (err, rows){

//         const user = rows[0];
//         console.log(user);

//         if(err) { return cb(err); }
//         bcrypt.compare(password, user, (err, rows) => {
//             if(err) { return cb(err); }
//             if(!rows){
//                 return cb(null, false, { message: 'Incorrect email or password' });
//             }
//             return cb(null, rows)
//         });
//     })
// }))

/*
    Default home pages when user has not logged in yet.
    These pages will be rendered for users who have not logged-in to the platform.

*/

// Default page: home get routes
router.get('/', (req, res) => {

    res.render('default/index', {title: 'Home | astablog'});
})




/*
    Logged-in user pages when user has logged in.
    These pages will be rendered for users who have logged-in to the platform.

*/

// Logged-in page: Home routes
router.get('/home', isAuth.isLoggedIn, (req, res) => { 
    res.render('user/home', {title: 'Home | astablog'});
});

// Logged-in page: Profile rooutes
router.get('/user/profile', isAuth.isLoggedIn, (req, res) => {
    res.render('user/profile', {title: 'Profile | astablog'});
});

// Logged-in page: Edit Profile routes
router.get('/edit/profile', isAuth.isLoggedIn, (req, res) => {
    res.render('user/editprofile', {title: 'Edit Profile | astablog'});
});

router.post('/edit/profile', isAuth.isLoggedIn, (req, res) => {
    res.redirect(303, '/user/profile');
});

// Logged-in page: Write Article routes
router.get('/create/article', isAuth.isLoggedIn, (req, res) => {
    res.render('user/createarticle', {title: 'Write Article | astablog'})
});

router.post('/create/article', isAuth.isLoggedIn, (req, res) => {
    res.redirect(303, '/article')
});

//Admin page
router.get('/asta-admin', isAuth.isLoggedIn, (req, res) => {
    res.render('admin/dashboard', {title: 'Admin Dashboard | astablog' });
});

router.get('/asta-admin/articles', isAuth.isLoggedIn, (req, res) => {
    res.render('admin/article', {title: 'Admin Article List | astaBlog'})
})

module.exports = router;

