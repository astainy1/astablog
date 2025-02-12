// User model for database operations

const db = require('../config/db');
const bcrypt = require('bcryptjs');


// Register User
// exports.registerUser = (username, email, password, callback) => {
//     bcrypt.hash(password, 10, (err, hashedPassword) => {
//         if (err) return callback(err);

//         const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
//         db.query(sql, [username, email, hashedPassword], callback);
//     });
// };

// Find User by Email
// exports.findUserByEmail = (email, callback) => {
//     const sql = "SELECT * FROM users WHERE email = ?";
//     db.query(sql, [email], (err, results) => {
//         if (err) return callback(err);
//         if (results.length === 0) return callback(null, null);
//         return callback(null, results[0]);
//     });
// };