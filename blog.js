const express = require("express");
const app = express();
const fs = require("fs");
const flash = require("connect-flash");
require("dotenv").config();
const port = process.env.PORT || 4100;
const path = require("path");
const session = require("express-session");
const errorHander = require("errorhandler");
const bodyParser = require("body-parser");

//Custom modules
const routes = require("./routes/index.js");
const { notFound, serverError } = require("./middlewares/error.js");
const authRoutes = require("./routes/auth.js");
const { debug, error } = require("console");

// Set up middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("public/uploads"));

// Set up view engine
app.set("view engine", "ejs");

// Set up utility middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Middleware to get data from the frontend
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

//Create various directory if not exist.
const profileDir = path.join(__dirname, "uploads/profile");
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
  console.log("user profile directory is created");
}

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SCRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

// Set up flash middleware
app.use(flash());

//Use auth routes
app.use(authRoutes);

// Use index routes
app.use(routes);

// Error middleware
// if (process.env.NODE_ENV === "development") {
//   app.use(errorHander);
// }

app.use(notFound);
app.use(serverError);

// Run express server and configure to listen on defined port
app.listen(port, (err) => {
  if (err) {
    console.log(`Sorry, there is an error: ${err.message || err.stack}`);
  } else {
    console.log(`Server is listening on port: http://localhost:${port}
        Press Ctrl+C to stop the server`);
  }
});
