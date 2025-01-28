const express = require('express');
const app = express();
 require('dotenv').config();
const port = process.env.PORT || 4100;
const path = require('path');
const routes = require('./routes/routers.js');

// Set up middleware for serving static file
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Let express app listen to request and provide responses

// Default home routes
app.get('/', routes.homeGetRoute)

// Login routes
app.get('/login', routes.loginGetRoute);
app.post('/user', routes.loginPostRoute);

// Register routes
app.get('/register', routes.registerGetRoute);
app.post('/register', routes.registerPostRoute);

// Account recovery routes
app.get('/recoveraccount', routes.accoutRecoverGetRoute)
app.post('/reset', routes.accoutRecoverPostRoute)

// Password reset routes
app.get('/reset', routes.resetPasswordGetRoute)
app.post('/login', routes.resetPasswordPostRoute)

// Logged in user routes 
app.get('/home', routes.userWorkspaceGetRoute);

// Profile routes
app.get('/profile', routes.userProfileGetRoute);

// Write article routes
app.get('/article', routes.writeGetRoute);

// Post routes
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
