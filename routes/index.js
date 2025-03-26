// import node modules
const express = require("express");
const router = express.Router();
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

//Custom modules
const db = require("../config/db");
const isAuth = require("../middlewares/isLoggedIn");

// Middleware to protect admin routes
const isAdmin = require("../middlewares/isLoggedIn");

// Configure transporter (using my google SMTP credentials)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "astablog0@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // debug: true,
  // logger: true,
});

console.log("App Password Loaded:", process.env.APP_PASSWORD ? "Yes" : "No");

//Verify transporter configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("SMTP Connection Error:", error.stack);
//   } else {
//     console.log("SMTP Connection Success:", success);
//   }
// });

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/profile");
    },
    filename: function (req, file, cb) {
      // cb(null, Date.now() + path.extname(file.originalname));
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// Article image uploads
const uploadArticleImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/post");
    },
    filename: function (req, file, cb) {
      // cb(null, Date.now() + path.extname(file.originalname));
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
  }),
});

// Header images uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/sliders/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadHeaderImage = multer({ storage });

/*
    Default home pages.
    These pages will be rendered for users who have not logged-in to the platform.

*/

// Default page: home get routes
router.get("/", (req, res) => {
  //Retrieve all articles from Database and display on the default home page
  const articles = `SELECT * FROM users INNER JOIN posts WHERE users.id = posts.user_id ORDER BY posts.created_at DESC`;

  db.query(articles, [], (err, rows) => {
    if (err) {
      console.error(
        "Error fetching articles from posts table: ",
        err.stack || err.message
      );
      return res.status(500);
    }

    if (!rows.length) {
      return res.render("default/index", {
        title: "Home | astablog",
        articles: [],
        sidebarText: "Summary",
      });
    }

    // Retrieve total comment for each post respectively
    const postIds = rows.map((article) => article.id);
    const commentsQuery = `SELECT post_id, COUNT(*) AS totalComments FROM comments WHERE post_id IN (?) GROUP BY post_id`;
    db.query(commentsQuery, [postIds], (err, comments) => {
      if (err) {
        console.error(
          "Error fetching comments:",
          err.stack || err.message || err
        );
        return res.status(500);
      }

      if (!comments.length) {
        return res.render("default/index", {
          title: "Home | astablog",
          articles: rows,
          sidebarText: "Summary",
        });
      }

      // Map comment counts to respective posts
      const commentsMap = comments.reduce((map, comment) => {
        map[comment.post_id] = comment.totalComments;
        return map;
      }, {});

      // Add comment count to each post
      rows.forEach((article) => {
        article.totalComments = commentsMap[article.id] || 0;
      });

      //Get total reaction of each post
      const totalReaction = `SELECT post_id, COUNT(*) AS total_reaction FROM reactions WHERE post_id IN (?) GROUP BY post_id`;

      db.query(totalReaction, [postIds], (err, reactionRows) => {
        if (err) {
          console.log(
            "Error retrieving total reaction from reaction table: ",
            err.stack || err.message
          );
          return res.redirect(303, "/");
        } else {
          // console.log(reactionRows);
          const getTotalReaction = reactionRows.reduce((map, reactions) => {
            map[reactions.post_id] = reactions.total_reaction;
            return map;
          }, {});

          rows.forEach((reaction) => {
            reaction.total_reaction = getTotalReaction[reaction.id] || 0;
          });

          // console.log(getTotalReaction);
          // console.log(rows);

          return res.render("default/index", {
            title: "Home | astablog",
            articles: rows,
            totalReaction: reactionRows.total_reaction,
            sidebarText: "Summary",
          });
        }
      });
    });
  });
});

/*
    Logged-in user pages.
    These pages will be rendered for users who have logged-in to the platform.

*/

// Logged-in page: Home routes
router.get("/home", isAuth.isLoggedIn, (req, res) => {
  // Retrieve user details stored in session
  const userName = req.session.userFound;

  // Retrieve all articles from Database
  const articlesQuery = `SELECT * FROM users INNER JOIN posts ON users.id = posts.user_id ORDER BY posts.created_at DESC`;
  db.query(articlesQuery, (err, articles) => {
    if (err) {
      console.error("Error fetching articles:", err.stack || err.message);
      return res.status(500);
    }

    if (!articles.length) {
      return res.render("user/home", {
        title: "Home | astablog",
        userInfo: userName.username,
        articles: [],
        sidebarText: "Subscribe to our Newsletter",
      });
    }

    // Retrieve total comments for each post
    const postIds = articles.map((article) => article.id);
    const commentsQuery = `SELECT post_id, COUNT(*) AS totalComments FROM comments WHERE post_id IN (?) GROUP BY post_id`;
    db.query(commentsQuery, [postIds], (err, comments) => {
      if (err) {
        console.error("Error fetching comments:", err);
        return res.status(500);
      }

      // Map comment counts to respective posts
      const commentMap = comments.reduce((acc, { post_id, totalComments }) => {
        acc[post_id] = totalComments;
        return acc;
      }, {});

      // Attach comment count to articles
      const enrichedArticles = articles.map((article) => ({
        ...article,
        totalComments: commentMap[article.id] || 0,
      }));

      //Get total reaction of each post
      const totalReaction = `SELECT post_id, COUNT(*) AS total_reaction FROM reactions WHERE post_id IN (?) GROUP BY post_id`;

      db.query(totalReaction, [postIds], (err, reactionRows) => {
        if (err) {
          console.log(
            "Error retrieving total reaction from reaction table: ",
            err.stack || err.message
          );
          return res.redirect(303, "/");
        } else {
          // console.log(reactionRows);
          const getTotalReaction = reactionRows.reduce((map, reactions) => {
            map[reactions.post_id] = reactions.total_reaction;
            return map;
          }, {});

          enrichedArticles.forEach((reaction) => {
            reaction.total_reaction = getTotalReaction[reaction.id] || 0;
          });

          // console.log(getTotalReaction);
          // console.log(articles);

          // console.log(enrichedArticles);
          res.render("user/home", {
            title: "Home | astablog",
            sidebarText: "Subscribe to our  Newsletter",
            userInfo: userName.username,
            articles: enrichedArticles,
          });
        }
      });
    });
  });
});

// Logged-in page: Profile routes
router.get("/user/profile", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;

  //Retrive all user details from database
  const userDetails = `SELECT full_name, username, email, profile_picture, bio, location, facebook_id, twitter_id, profession FROM users WHERE id = ?`;

  db.query(userDetails, [userName.id], (err, result) => {
    if (err) {
      console.error(
        "Error retriving user data from database: ",
        err.stack || err.message
      );
      req.flash("error", "Something went wrong. Please try again.");
      return res.redirect(303, "/user/profile");
    } else {
      //   console.log("User details retrieved", result);
      res.render("user/profile", {
        title: "Profile | astablog",
        userInfo: userName.username,
        userDetail: result,
        message: req.flash("error"),
      });
      return;
    }
  });
});

// News Letter Subscription API
router.post("/api/subscribe/newsletter", isAuth.isLoggedIn, (req, res) => {
  //Get email from the subscribe form
  const userId = req.session.userFound;
  const { email } = req.body;

  if (!email) {
    // console.log('Please enter your email');
    res.json({
      success: false,
      message: "Please enter your email address.",
    });
    return;
  }

  //Check for duplicate email
  const queryEmail = `SELECT * FROM news_letter WHERE email = ? `;

  db.query(queryEmail, [email], (err, row) => {
    if (err) {
      console.log("Error checking for duplicate news_letter email");
      return res.status(500);
    } else {
      // console.log(row.length);
      if (row.length > 0) {
        res.json({
          success: false,
          message: "You have already subscribed!",
        });
        return;
      }

      console.log("Thank you for subscribing to our new letter.");

      //Insert subscriber email into newletter table
      const insertEmail = `INSERT INTO news_letter (user_id, email) VALUES(?, ?)`;

      db.query(insertEmail, [userId.id, email], (err, result) => {
        if (err) {
          console.log(
            "Error inserting user emain into newsletter table: ",
            err.stack || err.message
          );
          res.json({
            success: false,
            message: "Failed to subscribe to our new letter.",
          });
          return;
        } else {
          // send email

          try {
            const mailOptions = {
              from: '"Asta Blog" <noreply.asta@blog.org>',
              to: email,
              subject: "🎉 Thank You for Subscribing to Asta Blog! 🚀",
              text: `Hello ${userId.username}, thank you for subscribing to our newsletter. Stay tuned for updates!`,
              html: `
              <div style="background-color: #f4f4f4; padding: 20px;">
                <table style="width: 100%; max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="text-align: center; padding: 20px 0;">
                      <img src="https://astablog.onrender.com/img/logo/logo-black.png" alt="Asta Blog" width="150" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; font-family: Arial, sans-serif; color: #333;">
                      <h2 style="text-align: center; color: #007bff;">Welcome, ${
                        userId.username
                      }! 🎉</h2>
                      <p style="font-size: 16px; text-align: center; line-height: 1.6;">
                        Thank you for subscribing to <strong>Asta Blog</strong>! You're now part of our amazing community where you'll receive the latest updates, articles, and exclusive content.
                      </p>
                      <p style="font-size: 16px; text-align: center;">
                        Stay tuned, and let's embark on this exciting journey together! 🚀
                      </p>
                      <div style="text-align: center; margin: 20px 0;">
                        <a href="https://astablog.onrender.com" style="background: #ff105f; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px;">Visit Our Blog</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-size: 12px; color: #888; padding: 10px;">
                      &copy; ${new Date().getFullYear()} Asta Blog. All rights reserved.
                    </td>
                  </tr>
                </table>
              </div>
              `,
            };

            transporter.sendMail(mailOptions);
            console.log("Email sent: ");
            res.json({
              success: true,
              message: "You have subscribed to our new letter.",
            });
            return;
          } catch (error) {
            console.error("Error sending email:", error);
          }
        }
      });
    }
  });
});

// Logged-in page: Edit Profile routes
router.get("/edit/profile", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;

  //Populate user details in the respective fields
  const getAllUserDetails = `SELECT profile_picture, username, full_name, location, bio, facebook_id, twitter_id, profession FROM users WHERE id = ?`;

  db.query(getAllUserDetails, [userName.id], (err, results) => {
    if (err) {
      console.error("Error retrieving user details: " + err.stack);
      res.redirect(303, "/user/profile");
    } else {
      // console.log(results[0]);
      const dbResults = results[0];

      res.render("user/editprofile", {
        title: "Edit Profile | astablog",
        userInfo: userName.username,
        message: req.flash("error"),
        userDetails: dbResults,
      });
    }
  });
});

router.post(
  "/edit/profile",
  isAuth.isLoggedIn,
  upload.single("profilePhoto"),
  (req, res, next) => {
    //Get user details from request body
    const userID = req.session.userFound;
    const loggedUserID = userID.id;
    // console.log(userID);
    // console.log(userID.profilePicture);
    const profilePhoto = req.file;
    const profilePhotoURL = profilePhoto
      ? profilePhoto.filename
      : userID.profilePicture;

    // console.log(profilePhoto);
    const {
      username,
      full_name,
      location,
      bio,
      facebookID,
      twitterID,
      profession,
    } = req.body;

    //console.log(username, full_name, location, bio, userID)

    const updateUserProfile = `UPDATE users SET profile_picture = ?, username = ?, full_name = ?, location = ?, \`bio\` = ?, facebook_id = ?, twitter_id = ?, profession = ? WHERE id = ?`;

    db.query(
      updateUserProfile,
      [
        profilePhotoURL,
        username,
        full_name,
        location,
        bio,
        facebookID,
        twitterID,
        profession,
        loggedUserID,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating user profile: " + err.stack);
          req.flash("error", "Error updating profile. Please try again.");
          res.redirect(303, "/edit/profile");
        } else {
          if (!result.length === 0) {
            // console.log('User profile updated ', result);
            res.redirect(303, "/user/profile");
          } else {
            console.log("User profile updated  with same info");
            res.redirect(303, "/user/profile");
          }
        }
      }
    );
  }
);

// Logged-in page: View another user Profile routes

router.get("/viewprofile/:id?", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;
  const userProfileId = req.params.id;
  // console.log(userProfileId);

  const profileQuery = `SELECT * FROM users WHERE id = ? `;
  db.query(profileQuery, [userProfileId], (err, rows) => {
    if (err) {
      console.error("Error retrieving user details for preview: ", err.stack);
      res.status(500);
    } else {
      // console.log(rows);
      const userInfo = rows[0];
      res.render("user/viewprofile", {
        title: `View Profile | ${userInfo.username}`,
        userInfo: userName.username,
        viewUserDetails: userInfo,
      });
    }
  });
});

// Logged-in page: Write Article routes
router.get("/create/article", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;

  res.render("user/createarticle", {
    title: "Write Article | astablog",
    message: req.flash("error"),
    userInfo: userName.username,
  });
});

// Handle article creation
router.post(
  "/create/article",
  isAuth.isLoggedIn,
  uploadArticleImage.single("article_image"),
  (req, res) => {
    const userID = req.session.userFound.id;
    // console.log(userID);

    // Sanitize summernote CKEditor content before sending to the database
    const cleanContent = sanitizeHtml(editordata, {
      allowedTags: [
        "p",
        "b",
        "i",
        "u",
        "a",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "strong",
        "em",
        "blockquote",
        "code",
        "pre",
        "ul",
        "ol",
        "li",
        "br",
        "hr",
        "span",
        "div",
        "iframe",
        "audio",
        "video",
        "source",
        "figcaption",
        "figure",
        "address",
      ],
      allowedAttributes: {
        "*": ["style", "class"],
        a: ["href", "target"],
        img: ["src", "alt", "width", "height"],
        table: ["border", "cellspacing", "cellpadding"],
        iframe: ["src", "frameborder", "allow", "allowfullscreen"],
        audio: ["src", "controls"],
        video: ["src", "controls"],
        source: ["src", "type"],
        blockquote: ["cite"],
        span: ["class"],
      },
      disallowedTagsMode: "discard",
    });

    const { article_title } = req.body;
    const articleImage = req.file ? req.file.filename : null;

    // console.log(article_title, cleanContent, articleImage, userID);
    try {
      if (!article_title && !editordata) {
        console.log("Please fill out the input fileds");
        req.flash("error", "Please fill out the input fileds.");
        res.redirect("/create/article");
      } else {
        // Save article in the database
        const insertArticle = `INSERT INTO posts (title, body, image, user_id) VALUES (?, ?, ?, ?)`;

        db.query(
          insertArticle,
          [article_title, cleanContent, articleImage, userID],
          (error, results) => {
            if (error) {
              console.error("Error creating article:", error.stack);
              req.flash("error", "Something went wrong. Please try again.");
              return res.status(500).send("Internal Server Error");
            }

            // Redirect after saving the article
            res.redirect(303, "/post");
          }
        );
      }
    } catch (error) {
      console.error("Error handling images:", error);
      res.status(500).send("Internal Server Error");
    }
    // });
  }
);

//Logged-in page: Read Article
router.get("/post/:id?", isAuth.isLoggedIn, (req, res) => {
  const userName = req.session.userFound;
  const postId = req.params.id;
  console.log(req.params);

  //Join post, users, comments, reaction tables to get all the details of the post and display to front end.
  const allArticle = `
    SELECT
    posts.id AS post_id,
    posts.title AS post_title,
    posts.body AS post_body,
    posts.image AS post_image,
    posts.created_at AS post_created_at,
    posts.updated_at AS post_updated_at,

    users.id AS post_author_id,
    users.username AS post_author,
    users.full_name AS post_author_full_name,
    users.bio AS post_author_bio,
    users.profession AS post_author_profession,
    users.facebook_id AS post_author_facebook,
    users.twitter_id AS post_author_twitter,
    users.email AS post_author_email,
    users.profile_picture AS post_author_profile_picture,

    comments.id AS comment_id,
    comments.user_id AS comment_author_id,
    comments.comment AS comment_text,
    comments.created_at AS comment_created_at,

    comment_user.username AS comment_author,
    comment_user.profile_picture AS comment_author_profile_picture,

    replies.id AS reply_id,
    replies.comment AS reply_text,
    replies.created_at AS reply_created_at,
    reply_user.id AS reply_author_id,
    reply_user.username AS reply_author_username,
    reply_user.profile_picture AS reply_author_profile_picture,

    reactions.reaction_type AS reaction_type,
    reactions.created_at AS reaction_created_at
    
    FROM posts
    JOIN users ON users.id = posts.user_id
    LEFT JOIN comments ON comments.post_id = posts.id AND comments.parent_comment_id IS NULL
    LEFT JOIN users AS comment_user ON comment_user.id = comments.user_id

    LEFT JOIN comments AS replies ON replies.parent_comment_id = comments.id
    LEFT JOIN users AS reply_user ON reply_user.id = replies.user_id
    LEFT JOIN reactions ON reactions.post_id = posts.id
    WHERE posts.id = ?
  `;
  db.query(allArticle, [postId], (err, result) => {
    if (err) {
      console.error(`Error retrieving data from post table: ${err.stack}`);
      res.status(500);
    } else {
      if (result.length > 0) {
        // Process the result into structured data
        const post = result[0];

        // console.log(post);
        const postComments = result;

        const getComment = result.filter((comment) => {
          return comment;
        });
        // console.log(getComment);

        // console.log(result.length);
        // const postCommentsReplies = result;
        // console.log(postCommentsReplies)

        // const reactions = result.filter((reaction) => reaction.reaction_type);

        // console.log('Comments: ', comments);
        // console.log('Reaction: ', reactions);

        // Retrieve all recent post from posts table joined with users table
        const recentPosts = `SELECT * FROM users, posts WHERE users.id = posts.user_id`;

        db.query(recentPosts, [], (err, row) => {
          if (err) {
            console.error(
              "Error retrieving recent posts from posts table: ",
              err.stack
            );
            res.status(500);
          } else {
            const totalComment = `SELECT COUNT(*) AS totalComments FROM comments WHERE post_id = ?`;

            db.query(totalComment, [postId], (err, commentRows) => {
              if (err) {
                console.error(`Error getting total comments: ${err.stack}`);
                res.status(500);
              } else {
                // console.log(commentRows[0]);

                // console.log(postComments);
                // console.log(reactions);

                // postComments.forEach((comment) =>{
                //   console.log(comment);
                // })

                // for(let comment of postComments){
                //   console.log(comment);
                // }

                res.render("user/post", {
                  title: `Article | astablog}`,
                  userInfo: userName.username,
                  post: result[0], // Pass the post data to the view
                  postComments: result,
                  // postCommentsReplies: result,
                  reactions: result,
                  recentPost: row,
                  totalComment: commentRows[0],
                  message: req.flash("error"),
                  replyMessage: req.flash("error"),
                });
              }
            });
          }
        });
      } else {
        res.status(404);
      }
    }
  });
});

//Logged-in page: Reaction to post api to send to the frontend
router.post("/react", isAuth.isLoggedIn, (req, res) => {
  const { post_id, reaction_type } = req.body;
  const user_id = req.session.userFound.id;

  const checkReaction = `SELECT * FROM reactions WHERE post_id = ? AND user_id = ?`;

  db.query(checkReaction, [post_id, user_id], (err, result) => {
    if (err) {
      console.error("Error checking reaction:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      // If user has already reacted, remove the reaction
      const deleteReaction = `DELETE FROM reactions WHERE post_id = ? AND user_id = ?`;
      db.query(deleteReaction, [post_id, user_id], (err) => {
        if (err) {
          console.error("Error removing reaction:", err);
          return res.status(500).json({ error: "Database error" });
        }
        return res.json({ success: true, message: "Reaction removed" });
      });
    } else {
      // Insert new reaction
      const insertReaction = `INSERT INTO reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)`;
      db.query(insertReaction, [post_id, user_id, reaction_type], (err) => {
        if (err) {
          console.error("Error inserting reaction:", err);
          return res.status(500).json({ error: "Database error" });
        }
        return res.json({ success: true, message: "Reaction added" });
      });
    }
  });
});

//Logged-in page: Reaction count

router.get("/reactions/:post_id", (req, res) => {
  const post_id = req.params.post_id;

  const getReactions = `SELECT reaction_type, COUNT(*) as count FROM reactions WHERE post_id = ? GROUP BY reaction_type`;

  db.query(getReactions, [post_id], (err, results) => {
    if (err) {
      console.error("Error fetching reactions:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const reactionCounts = { like: 0, dislike: 0 };
    results.forEach((row) => {
      reactionCounts[row.reaction_type] = row.count;
    });

    res.json({ reactions: reactionCounts });
  });
});

//Logged-in page: Comment
router.post("/post/:id?", isAuth.isLoggedIn, (req, res) => {
  try {
    const { comment } = req.body;
    const { id } = req.params;
    const user_id = req.session.userFound.id;

    if (!comment) {
      console.log("Comment cannot be empty.");
      req.flash("error", "Comment cannot be empty.");
      res.redirect(`/post/${id}`);
    } else {
      // console.log(comment, id);
      // console.log('User ID: ', user_id);

      const insertComment = `INSERT INTO comments (post_id, user_id, comment) VALUES(?, ?, ?)`;

      db.query(insertComment, [id, user_id, comment], (err, result) => {
        if (err) {
          console.error(
            "Error inserting comment into comment table: ",
            err.stack
          );
          res.status(500);
        } else {
          // console.log(`User with ID ${user_id} has successfully commented on post with ID ${id}`);
          res.redirect(`/post/${id}`);
        }
      });
    }
  } catch (error) {
    console.error("Something went wrong", error.stack);
    req.flash("error", "Something went wrong. Please try again.");
    res.status(500);
  }
});

//Logged-in page: Reply to Comment
router.post("/post/:id/reply", isAuth.isLoggedIn, (req, res) => {
  try {
    // console.log(req);

    const { reply_comment, parent_comment_id } = req.body;
    const { id } = req.params;
    const user_id = req.session.userFound.id;
    // console.log('Parent ID: ', parent_comment_id);
    // console.log(req.body)
    // console.log('Reply Message: ', reply_comment);
    //Check if replay is empty
    if (!reply_comment || !parent_comment_id || !id) {
      console.log("Empty reply message. Please write a reply message.");
      // flash('error', 'Empty reply');
      res.redirect(303, `/post/${id}?empty%reply`);
      return;
    } else {
      const replyMessageQuery = `INSERT INTO comments (post_id, user_id, comment, parent_comment_id) VALUE(?, ?, ?, ?)`;

      db.query(
        replyMessageQuery,
        [id, user_id, reply_comment, parent_comment_id],
        (err, result) => {
          if (err) {
            console.error(
              "Error inserting reply into comment table",
              err.stack
            );
            res.status(500);
            return;
          } else {
            // console.log(`User with ID ${user_id} has reply to post with ID ${id} user comment ${parent_comment_id}. Here is the reply: ${reply_comment}`);
            res.redirect(`/post/${id}?reply`);
            return;
          }
        }
      );
    }
  } catch (error) {
    console.error(`Something went wrong: ${error.stack}`);
    res.status(500);
    return;
  }
});

//Admin pages

// Admin dashboard
router.get("/asta-admin", isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {
  // Get user id stored in session
  const userID = req.session.userFound;
  // console.log('Admin ID: ', userID);
  // Get user details from database
  const userDetails = `SELECT * FROM users WHERE id = ?`;

  // Get total number of users, artcles, comments and reactions
  const totalUsers = `SELECT COUNT(*) AS totalUsers FROM users`;
  const totalArticles = `SELECT COUNT(*) AS totalArticles FROM posts`;
  const totalComments = `SELECT COUNT(*) AS totalComments FROM comments WHERE parent_comment_id IS NULL`;
  const totalReply = `SELECT COUNT(*) AS totalReply FROM comments WHERE parent_comment_id IS NOT NULL`;

  db.query(totalUsers, (err, users) => {
    if (err) {
      console.error("Error fetching total users:", err);
      return res.status(500);
    }
    db.query(totalArticles, (err, articles) => {
      if (err) {
        console.error("Error fetching total articles:", err);
        return res.status(500);
      }
      db.query(totalComments, (err, comments) => {
        if (err) {
          console.error("Error fetching total comments:", err);
          return res.status(500);
        }
        db.query(totalReply, (err, replies) => {
          if (err) {
            console.error("Error fetching total reactions:", err);
            return res.status(500);
          }

          db.query(userDetails, [userID.id], (err, result) => {
            if (err) {
              console.error("Error fetching user details:", err);
              return res.status(500);
            }

            res.render("admin/dashboard", {
              title: "Admin Dashboard | astablog",
              totalUsers: users[0].totalUsers,
              totalArticles: articles[0].totalArticles,
              totalComments: comments[0].totalComments,
              totalReply: replies[0].totalReply,
              userInfo: result[0],
            });
          });
        });
      });
    });
  });
});

// Admin Article List
router.get(
  "/asta-admin/articles",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }
      // console.log(result);
      //Get all published articles and display into Articles Table
      const allArticles = `SELECT * FROM users INNER JOIN posts ON users.id = posts.user_id`;

      db.query(allArticles, [], (err, articles) => {
        if (err) {
          console.error("Error fetching articles:", err.stack || err);
          return res.status(500);
        } else {
          // const articlesDetails = articleRows.map(row => {
          //   return row;
          // })

          // console.log(articlesDetails);

          // Retrieve total comments for each post
          const postIds = articles.map((article) => article.id);
          const commentsQuery = `SELECT post_id, COUNT(*) AS totalComments FROM comments WHERE post_id IN (?) GROUP BY post_id`;
          db.query(commentsQuery, [postIds], (err, comments) => {
            if (err) {
              console.error("Error fetching comments:", err);
              return res.status(500);
            }

            // Map comment counts to respective posts
            const commentMap = comments.reduce(
              (acc, { post_id, totalComments }) => {
                acc[post_id] = totalComments;
                return acc;
              },
              {}
            );

            // Attach comment count to articles
            const articleRows = articles.map((article) => ({
              ...article,
              totalComments: commentMap[article.id] || 0,
            }));

            //Get total reaction of each post
            const totalReaction = `SELECT post_id, COUNT(*) AS total_reaction FROM reactions WHERE post_id IN (?) GROUP BY post_id`;

            db.query(totalReaction, [postIds], (err, reactionRows) => {
              if (err) {
                console.log(
                  "Error retrieving total reaction from reaction table: ",
                  err.stack || err.message
                );
                return res.redirect(303, "/");
              } else {
                // console.log(reactionRows);
                const getTotalReaction = reactionRows.reduce(
                  (map, reactions) => {
                    map[reactions.post_id] = reactions.total_reaction;
                    return map;
                  },
                  {}
                );

                articleRows.forEach((reaction) => {
                  reaction.total_reaction = getTotalReaction[reaction.id] || 0;
                });

                // console.log(getTotalReaction);
                // console.log(articles);

                console.log(articleRows);
                res.render("admin/article", {
                  title: "Admin Article List | astaBlog",
                  userInfo: result[0],
                  article: articleRows,
                });
              }
            });
          });
        }
      });
    });
  }
);

// Admin comments
router.get(
  "/asta-admin/comments",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }
      // console.log(result);
      res.render("admin/comments", {
        title: "Admin Comments List | astaBlog",
        userInfo: result[0],
      });
    });
  }
);

// Admin Replies

router.get(
  "/asta-admin/replies",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }
      // console.log(result);
      res.render("admin/replies", {
        title: "Admin Replies List | astaBlog",
        userInfo: result[0],
      });
    });
  }
);

// Admin New Letter - Get route

router.get(
  "/asta-admin/newsletter",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }
      // console.log(result);
      res.render("admin/newsletter", {
        title: "Admin News Letter List | astaBlog",
        userInfo: result[0],
      });
    });
  }
);

// Admin News Letter - Post route
// router.post(

// )

// Admin users list
router.get(
  "/asta-admin/users",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user ID stored in session
    const userID = req.session.userFound;

    // Get user details from database
    const userDetailsQuery = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetailsQuery, [userID.id], (err, userResult) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500).send("Internal Server Error");
      }

      // Get all non-admin users
      const allUsersQuery = `SELECT * FROM users WHERE is_admin = 0`;
      db.query(allUsersQuery, [], (err, users) => {
        if (err) {
          console.error("Error querying all users:", err.stack || err);
          return res.status(500).send("Internal Server Error");
        }

        // Get post counts per user
        const postCountQuery = `SELECT user_id, COUNT(*) AS totalPost FROM posts GROUP BY user_id`;
        db.query(postCountQuery, [], (err, postCounts) => {
          if (err) {
            console.error(
              "Error getting total articles for each user:",
              err.stack || err
            );
            return res.status(500).send("Internal Server Error");
          }

          // Create a lookup object for post counts
          const postCountMap = {};
          postCounts.forEach((row) => {
            postCountMap[row.user_id] = row.totalPost;
          });

          // Merge post counts into user data (ensuring no duplicates)
          users.forEach((user) => {
            user.totalPost = postCountMap[user.id] || 0; // Default to 0 if no posts
          });

          // Render the page
          res.render("admin/users", {
            title: "Admin Users List | astaBlog",
            userInfo: userResult[0] || {},
            allUser: users,
          });
        });
      });
    });
  }
);

// Admin route to handle image upload
// router.post('/asta-admin/upload-slider', uploadHeaderImage.single('sliderImage'), (req, res) => {

router.post(
  "/api/upload-slider",
  uploadHeaderImage.single("sliderImage"),
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;

    const sub_title = req.body.sub_title;
    const main_title = req.body.main_title;

    // console.log(sub_title, main_title);

    // Check if a file was uploaded and if the required fields are present
    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }
    if (!req.body.sub_title) {
      return res.json({ success: false, message: "Please provide Sub Title" });
    }
    if (!req.body.main_title) {
      return res.json({ success: false, message: "Please provide Main Title" });
    }

    const imagePath = "/uploads/sliders/" + req.file.filename;
    const query =
      "INSERT INTO header_images (image_path, uploaded_by, subtitle, maintitle) VALUES (?, ?, ?, ?)";

    db.query(query, [imagePath, userID.id, sub_title, main_title], (err) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.json({ success: false });
      }
      res.json({
        success: true,
        imagePath,
        message: "Image uploaded successfully.",
      });
    });
  }
);

// API route for image slider
router.get("/api/sliders", (req, res) => {
  const getSliders = `SELECT * FROM header_images ORDER BY uploaded_at DESC`;

  db.query(getSliders, (err, results) => {
    if (err) {
      console.error(
        "Error fetching slider images:",
        err.stack || err.message || err
      );
      return res.status(500).json({ error: "Database error" });
    }
    // console.log(results);
    // Construct full image URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    // Store subtile, maintitle and image url in an object
    const slider = results.map((row) => ({
      imagePath: `${baseUrl}${row.image_path}`,
      subtitle: row.subtitle,
      maintitle: row.maintitle,
    }));
    // console.log(sliderData);
    // res.json(sliderData);
    // const imagePaths = results.map(row => `${baseUrl}${row.image_path}`);

    // const imageSubtitle = results.map(row => row.subtitle);
    // const imageMainTitle = results.map(row => row.maintitle);
    // console.log(imageSubtitle, imageMainTitle);

    res.json({ images: slider });
  });
});

router.post("/api/delete/user", (req, res) => {
  const { userID } = req.body;

  //Delete user from database
  const deleteUser = `DELETE FROM users WHERE id = ?`;
  db.query(deleteUser, [userID], (err, result) => {
    if (err) {
      console.error("Error deleting user: ", err.message || err.stack);
      res.json({ success: false, message: err.stack });
      return;
    } else {
      res.json({
        success: true,
        message: "Are you sure you want to delete this user?",
      });
      return;
    }
  });
});
// API route for deleting images
router.post("/api/delete-slider", (req, res) => {
  const { imageUrl } = req.body;

  // Extract filename from URL
  const filename = imageUrl.split("/uploads/sliders/")[1];
  const filePath = path.join(__dirname, "../public/uploads/sliders", filename);

  // Delete from database
  const query = "DELETE FROM header_images WHERE image_path = ?";
  db.query(query, ["/uploads/sliders/" + filename], (err) => {
    if (err) {
      console.error("Error deleting image from database:", err);
      return res.json({ success: false });
    }

    // Delete from filesystem
    fs.unlink(filePath, (fsErr) => {
      if (fsErr) console.error("File deletion error:", fsErr);
      return res.json({ success: true });
    });
  });
});

// Admin page Settings

router.get(
  "/asta-admin/settings",
  isAuth.isLoggedIn,
  isAdmin.isAdmin,
  (req, res) => {
    // Get user id stored in session
    const userID = req.session.userFound;
    // console.log('Admin ID: ', userID);
    // Get user details from database
    const userDetails = `SELECT * FROM users WHERE id = ?`;
    db.query(userDetails, [userID.id], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err.stack || err);
        return res.status(500);
      }

      // Retrieve all images
      const getSliders = `SELECT * FROM header_images ORDER BY uploaded_at DESC`;

      db.query(getSliders, (err, results) => {
        if (err) {
          console.error(
            "Error fetching slider images:",
            err.stack || err.message || err
          );
          return res.status(500).json({ error: "Database error" });
        }
        // console.log(results);
        // Construct full image URLs
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const sliderData = results.map((row) => ({
          image_path: `${baseUrl}${row.image_path}`,
          subtitle: row.subtitle || "",
          maintitle: row.maintitle || "",
        }));

        // const baseUrl = `${req.protocol}://${req.get('host')}`;
        // const imagePaths = results.map(row => `${baseUrl}${row.image_path}`);
        // const subTitle = results.map(row => row.subtitle);
        // const mainTitle = results.map(row => row.maintitle);

        // console.log(result);
        res.render("admin/settings", {
          title: "Admin Settings | astaBlog",
          userInfo: result[0],
          sliderData,
        });
      });
    });
  }
);

module.exports = router;
