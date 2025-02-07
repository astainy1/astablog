const express = require('express');
const app = express();

exports.notFoundGetRoute = (req, res, next) => {

    res.status(404);
    res.render('404', {title: 'Not Found | astaBlog'});
    
    return next();
}

exports.serverErrorRoute = (err, req, res, next) => {
    
    if(err){
        console.log(`Server Error: ${err.message}`);
    }

    res.status(500);
    res.render('500', {title: 'Server Error | astaBlog'});
    
    return next();

}
