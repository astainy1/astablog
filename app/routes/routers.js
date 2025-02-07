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

// Edit profile get route
exports.editProfileGetRoute = (req, res) => {
    res.render('user/editProfile', {title: 'Edit Profile | astaBlog'});
};

// Edit profile post route
exports.editProfilePostRoute = (req, res) => {
    res.redirect(303, '/user/profile');
};

// View user profile get route
exports.viewUserProfileGetRoute = (req, res) => {
    res.render('user/viewprofile', {title: 'Writer Profile | astaBlog'});
};

// View user profile post route
exports.viewUserProfilePostRoute = (req, res) => {
    res.redirect('/user/post');
};

// Write article get route
exports.articleGetRoute = (req, res) => {
    res.render('user/createarticle', {title: 'Write post | astaBlog'});
};

// Write article post route
exports.articlePostRoute = (req, res) => {

}



