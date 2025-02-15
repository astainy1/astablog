// Middleware to protect routes
module.exports.isLoggedIn = (req, res, next) => {
    if(req.session && req.session.userFound){
        next();
    }else{
        res.redirect('/login');
    }
}

// Middleware to protect admin routes
module.exports.isAdmin = (req, res, next) => {
    const isAdministration = req.session.userFound;
    console.log('Is Admin: ', isAdministration.isAdmin);
    if(isAdministration.isAdmin === 1){
        console.log('Ýou are allowed to this route');
        next();
    }else{
        console.log('You are not allowed to this route.');
        res.status(403);
        res.render('403', {title: 'Access Denied | astablog'});
    }
}