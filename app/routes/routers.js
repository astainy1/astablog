// import express framework and instantiate it
const express = require('express');
const app = express();

/*
    Default home pages when user has not logged in yet.
    These pages will be rendered when for logged out users.

*/

// Default Home page get route
exports.homeGetRoute = (req, res) => {
    res.render('default/index', {title: 'Home | astaBlog'});
}

// Default Home page post route
exports.homePostRoute = (req, res) => {

};

// Login page get route
exports.loginGetRoute = (req, res) => {
    res.render('default/login', {title: 'Login | astaBlog'});
};

// Login page post route
exports.loginPostRoute = (req, res) => {
    res.redirect(303, '/user/home')
};

// Register page get route
exports.registerGetRoute = (req, res) => {
    res.render('default/register', {title: 'Register | astaBlog'});
};

// Register page post route
exports.registerPostRoute = (req, res) => {

};

// Password reset page get route
exports.resetPasswordGetRoute = (req, res) => {
    res.render('default/resetpassword', {title: 'Password reset | astaBlog'});

}

// Password reset page post route
exports.resetPasswordPostRoute = (req, res) => {
    res.redirect(303, '/login');
};

// Account recover page get route
exports.accoutRecoverGetRoute = (req, res) => {
    res.render('default/recoveraccount', {title: 'Account recover | astaBlog'});
};

// Account recover page post route
exports.accoutRecoverPostRoute = (req, res) => {
    res.redirect(303, '/reset');
};

/* 
    
*/

// Logged in user home get route
exports.userHomeGetRoute = (req, res) => {
    res.render('user/home', {title: 'Article Home Page | astsaBlog'});
};

exports.userHomePostRoute = (req, res) => {

};

// View post page get route
exports.viewpostGetRoute = (req, res) => {
    res.render('user/post', {title: 'Post | astaBlog'});
};

// View post page post route
exports.viewpostPostRoute = (req, res) => {
    
};

// Profile get routes
exports.userProfileGetRoute = (req, res) => {
    res.render('user/profile', {title: 'Profile | astaBlog'});
};

// Profile post routes
exports.userProfilePostRoute = (req, res) => {

};

// Write article get route
exports.articleGetRoute = (req, res) => {
    res.render('user/createarticle', {title: 'Write post | astaBlog'});
};

// Write article post route
exports.articlePostRoute = (req, res) => {

}

