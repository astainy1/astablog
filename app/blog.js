const express = require('express');
const app = express();
 require('dotenv').config();
const port = process.env.PORT || 4100;
const path = require('path');
const routes = require('./routes/routers.js');
const errorRoutes = require('./middleware/error.js');
const controllers = require('./controllers/auth.js');

// Set up middleware for serving static file
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


//Disable express default X-Powered-By feature
app.disable('X-Powered-By');

// Listen to request and provide responses

// Default home routes
app.get('/', routes.homeGetRoute)

// Login routes
app.get('/login', controllers.loginGetRoute);
app.post('/user/home', controllers.loginPostRoute);

// Register routes
app.get('/register', controllers.registerGetRoute);
app.post('/register', controllers.registerPostRoute);

// Account recovery routes
app.get('/recoveraccount', controllers.accoutRecoverGetRoute)
app.post('/reset', controllers.accoutRecoverPostRoute)

// Password reset routes
app.get('/reset', controllers.resetPasswordGetRoute)
app.post('/login', controllers.resetPasswordPostRoute)

// Logged in user home routes 
app.get('/user/home', routes.userHomeGetRoute);

// Profile routes
app.get('/user/profile', routes.userProfileGetRoute);

// Edit profile routes
app.get('/user/editprofile', routes.editProfileGetRoute);
app.post('/user/profile', routes.editProfilePostRoute);

// View user profile
app.get('/user/viewprofile', routes.viewUserProfileGetRoute);

// Write article routes
app.get('/user/article', routes.articleGetRoute);

// View Post routes
app.get('/post', routes.viewpostGetRoute);


// Admin Dashboard routes
app.get('/astaAdmin', controllers.adminGetRoute);

// Status 404 Route
app.use(errorRoutes.notFoundGetRoute);

// Status 500 Route
app.use(errorRoutes.serverErrorRoute)

// Run express server and configure to list on defined port
app.listen(port, (err) => {
    if(err){
        console.log(`Sorry, there is an error: ${err.message}`);
    }else{
        console.log(`Server is listening on port: (http://localhost:${port})
        Press Ctrl + C to stop the server...`);
    }
});
