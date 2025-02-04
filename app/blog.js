const express = require('express');
const app = express();
 require('dotenv').config();
const port = process.env.PORT || 4100;
const path = require('path');
const routes = require('./routes/routers.js');

// Set up middleware for serving static file
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Listen to request and provide responses

// Default home routes
app.get('/', routes.homeGetRoute)

// Login routes
app.get('/login', routes.loginGetRoute);
app.post('/user/home', routes.loginPostRoute);

// Register routes
app.get('/register', routes.registerGetRoute);
app.post('/register', routes.registerPostRoute);

// Account recovery routes
app.get('/recoveraccount', routes.accoutRecoverGetRoute)
app.post('/reset', routes.accoutRecoverPostRoute)

// Password reset routes
app.get('/reset', routes.resetPasswordGetRoute)
app.post('/login', routes.resetPasswordPostRoute)

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






// Run express server and configure to list on defined port
app.listen(port, (err) => {
    if(err){
        console.log(`Sorry, there is an error: ${err.message}`);
    }else{
        console.log(`App is listening on port: (http://localhost:${port})
        Press Ctrl+C to stop the server`);
    }
});
