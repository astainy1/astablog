// Post model for blog posts

// const express = require("express");
// const router = express.Router();
// const { ensureAuthenticated } = require("../middlewares/auth");
// const db = require("../config/db");

// Create Post (Protected Route)
// router.get("/create", ensureAuthenticated, (req, res) => {
//     res.render("createPost");
// });

// Handle Post Submission
// router.post("/create", ensureAuthenticated, (req, res) => {
//     const { title, body } = req.body;
    
//     db.query(
//         "INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)",
//         [title, body, req.user.id],
//         (err, result) => {
//             if (err) return res.status(500).send("Error saving post.");
//             res.redirect("/dashboard");
//         }
//     );
// });

// module.exports = router;
