const express = require('express');
const app = express;
const db = require('../modals/db.js');


// Login page get route
exports.loginGetRoute = (req, res) => {
    // console.log(db)
    const selectAllTables = `SHOW TABLES`;
    db.query(selectAllTables, [], (err, rows) => {
        if(err){
            console.log('Error showing tables: ', err.message );
        }else{
            console.log(rows)
            res.render('default/login', {title: 'Login | astaBlog'});
        }
    });

    // res.render('default/login', {title: 'Login | astaBlog'});

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

exports.adminGetRoute = (req, res) => {
    res.render('admin/dashboard', {title: 'Dashboard | astablog'});
}

exports.adminPostRoute = (req, res) => {
    // Other logic here
}