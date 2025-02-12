// Middleware to protect routes
module.exports.isLoggedIn = (req, res, next) => {
    if(req.session && req.session.userFound){
        next();
    }else{
        res.redirect('/login');
    }
}