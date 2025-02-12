// Passport authentication configuration
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// import user modal here using destructure method
// const { findUserByEmail } = require("../models/User");

// module.exports = (passport) => {
//     passport.use(
//         new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
//             findUserByEmail(email, (err, user) => {
//                 if (err) return done(err);
//                 if (!user) return done(null, false, { message: "User not found" });

//                 bcrypt.compare(password, user.password, (err, isMatch) => {
//                     if (err) return done(err);
//                     if (isMatch) return done(null, user);
//                     return done(null, false, { message: "Incorrect password" });
//                 });
//             });
//         })
//     );

//     passport.serializeUser((user, done) => {
//         done(null, user.id);
//     });

//     passport.deserializeUser((id, done) => {
//         findUserByEmail(id, (err, user) => {
//             if (err) return done(err);
//             done(null, user);
//         });
//     });
// };