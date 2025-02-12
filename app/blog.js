const express = require('express');
const app = express();
const flash = require('connect-flash');
require('dotenv').config();
const port = process.env.PORT || 4100;
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); 

//Custom modules
const routes = require('./routes/index.js');
const { notFound, serverError } = require('./middlewares/error.js');
const authRoutes = require('./routes/auth.js');

// Set up middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine
app.set('view engine', 'ejs');

// Set up utility middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SCRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
}))

// app.use(session({
//     secret: process.env.SESSION_SCRET_KEY,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set to true in production with HTTPS
// }));

// Set up flash middleware 
app.use(flash());

//Use auth routes
app.use(authRoutes);

// Use index routes
app.use(routes);

// Error middleware
app.use(notFound);
app.use(serverError);

// Run express server and configure to listen on defined port
app.listen(port, (err) => {
    if (err) {
        console.log(`Sorry, there is an error: ${err.message}`);
    } else {
        console.log(`App is listening on port: http://localhost:${port}
        Press Ctrl+C to stop the server`);
    }
});