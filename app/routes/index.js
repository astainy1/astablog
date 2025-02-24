// import node modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const saltRounds = 12;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { body, validationResult } = require("express-validator");
const multer = require('multer');

const db = require("../config/db");
const isAuth = require("../middlewares/isLoggedIn");

// Middleware to protect admin routes
const isAdmin = require("../middlewares/isLoggedIn");


const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb){
            cb(null, 'public/uploads/profile');
        },
        filename: function (req, file, cb) {
            // cb(null, Date.now() + path.extname(file.originalname)); 
            cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
        }
    })
});


// Article image uploads
const uploadArticleImage = multer({
  storage: multer.diskStorage({
      destination: function (req, file, cb){
          cb(null, 'public/uploads/post');
      },
      filename: function (req, file, cb) {
          // cb(null, Date.now() + path.extname(file.originalname)); 
          cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
      }
  })
});

/*
    Default home pages.
    These pages will be rendered for users who have not logged-in to the platform.

*/

// Default page: home get routes
router.get("/", (req, res) => {

  //Retrieve all articles from Database and display on the default home page
  const articles = `SELECT * FROM users INNER JOIN posts WHERE users.id = posts.user_id`;

  db.query(articles, [], (err, rows) => {
    if(err){
      res.status(500)
      return console.error('Error fetching articles from posts table: ', err);
    }

    if(!rows.length){
      return res.render("default/index", { title: "Home | astablog", articles: []});
    }

    // Retrieve total comment for each post respectively
    const postIds = rows.map(article => article.id);
    const commentsQuery = `SELECT post_id, COUNT(*) AS totalComments FROM comments WHERE post_id IN (?) GROUP BY post_id`;
    db.query(commentsQuery, [postIds], (err, comments) => {
      if (err) {
        console.error("Error fetching comments:", err);
        return res.status(500);
      }

      if (!comments.length) {
        return res.render("default/index", {
          title: "Home | astablog",
          articles: rows,
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

      // console.log(rows);
      return res.render("default/index", {
        title: "Home | astablog",
        articles: rows});
      })
  })
  
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
  const articlesQuery = `SELECT * FROM users INNER JOIN posts ON users.id = posts.user_id`;
  db.query(articlesQuery, (err, articles) => {
    if (err) {
      console.error("Error fetching articles:", err);
      return res.status(500);
    }

    if (!articles.length) {
      return res.render("user/home", {
        title: "Home | astablog",
        userInfo: userName.username,
        articles: [],
      });
    }

    // Retrieve total comments for each post
    const postIds = articles.map(article => article.id);
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
      const enrichedArticles = articles.map(article => ({
        ...article,
        totalComments: commentMap[article.id] || 0,
      }));

      // console.log(enrichedArticles)
      res.render("user/home", {
        title: "Home | astablog",
        userInfo: userName.username,
        articles: enrichedArticles,
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
      console.error("Error retriving user data from database: ", err.message);
      req.flash("error", "Something went wrong. Please try again.");
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

// Logged-in page: Edit Profile routes
router.get("/edit/profile", isAuth.isLoggedIn, (req, res) => {
  //Retrive user details stored in session.
  const userName = req.session.userFound;
  

  //Populate user details in the respective fields
  const getAllUserDetails = `SELECT profile_picture, username, full_name, location, bio, facebook_id, twitter_id, profession FROM users WHERE id = ?`;

  db.query(getAllUserDetails, [userName.id], (err, results) => {
    if(err){
        console.error('Error retrieving user details: ' + err.stack); 
        res.redirect(303, '/user/profile');
    }else{
        console.log(results[0]);
        const dbResults = results[0];

        res.render("user/editprofile", {
            title: "Edit Profile | astablog",
            userInfo: userName.username,
            message: req.flash("error"), userDetails: dbResults,
          });
    }
  })

});

router.post("/edit/profile", isAuth.isLoggedIn, upload.single('profilePhoto'), (req, res, next) => {

    //Get user details from request body
    const userID = req.session.userFound;
    const loggedUserID = userID.id;
    // console.log(userID);
    // console.log(userID.profilePicture);
    const profilePhoto = req.file;
    const profilePhotoURL = profilePhoto ? profilePhoto.filename : userID.profilePicture;
    
    // console.log(profilePhoto);
  const {username, full_name, location, bio, facebookID, twitterID, profession} = req.body;

  //console.log(username, full_name, location, bio, userID)

  const updateUserProfile = `UPDATE users SET profile_picture = ?, username = ?, full_name = ?, location = ?, \`bio\` = ?, facebook_id = ?, twitter_id = ?, profession = ? WHERE id = ?`;

  db.query(updateUserProfile, [profilePhotoURL, username, full_name, location, bio, facebookID, twitterID, profession, loggedUserID], (err, result) => {
    if(err) {
        console.error('Error updating user profile: ' + err.stack);
        req.flash('error', 'Error updating profile. Please try again.');
        res.redirect(303, '/edit/profile');
    }else{

      if(!result.length === 0){
        console.log('User profile updated ', result);
        res.redirect(303, "/user/profile");
      }else{
        console.log('User profile updated  with same info');
        res.redirect(303, "/user/profile");
      }

    }
  });
});

// Logged-in page: View another user Profile routes
router.get('/viewprofile/:id?', isAuth.isLoggedIn, (req, res) => {

  //Retrive user details stored in session.
  const userName = req.session.userFound;
  const userProfileId = req.params.id;
  // console.log(userProfileId);

  const profileQuery = `SELECT * FROM users WHERE id = ? `;
  db.query(profileQuery, [userProfileId], (err, rows) => {
    if (err){
      console.error('Error retrieving user details for preview: ', err.stack);
      res.status(500);
    }else{

      // console.log(rows);
        const userInfo = rows[0];
        res.render('user/viewprofile', {title: `View Profile | ${userInfo.username}`, userInfo: userName.username, viewUserDetails: userInfo});
    }
  })


});

// router.post('/user/viewprofile', isAuth.isLoggedIn, (req, res) => {
//   res.redirect(303, '');
// });

// Logged-in page: Write Article routes
router.get("/create/article", isAuth.isLoggedIn, (req, res) => {
    //Retrive user details stored in session.
    const userName = req.session.userFound;

  res.render("user/createarticle", { title: "Write Article | astablog", message: req.flash("error"),  userInfo: userName.username, });
});

// Handle article creation
router.post("/create/article", isAuth.isLoggedIn, uploadArticleImage.single('article_image'), (req, res) => {

  const userID = req.session.userFound.id;
  // console.log(userID);

     // Sanitize the content before saving it to the database
     const cleanContent = sanitizeHtml(editordata, {
      allowedTags: [
        'p', 'b', 'i', 'u', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'strong', 'em', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'br', 'hr', 'span', 
        'div', 'iframe', 'audio', 'video', 'source', 'figcaption', 'figure', 'address'
      ],
      allowedAttributes: {
        '*': ['style', 'class'],
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height'],
        'table': ['border', 'cellspacing', 'cellpadding'],
        'iframe': ['src', 'frameborder', 'allow', 'allowfullscreen'],
        'audio': ['src', 'controls'],
        'video': ['src', 'controls'],
        'source': ['src', 'type'],
        'blockquote': ['cite'],
        'span': ['class'],
      },
      disallowedTagsMode: 'discard',
    });

  const { article_title} = req.body;
  const articleImage = req.file ? req.file.filename : null;
  
  console.log(article_title, cleanContent, articleImage, userID);
    try {
  

    if(!article_title && !editordata){

      console.log('Please fill out the input fileds');
      req.flash('error', 'Please fill out the input fileds.')
      res.redirect('/create/article');

    }else{
            // Save article in the database
            const insertArticle = `INSERT INTO posts (title, body, image, user_id) VALUES (?, ?, ?, ?)`;

            db.query(insertArticle, 
              [article_title, cleanContent, articleImage, userID], 
              (error, results) => {
                if (error) {
                  console.error("Error creating article:", error);
                  req.flash('error', 'Something went wrong. Please try again.');
                  return res.status(500).send("Internal Server Error");
                }
      
                // Redirect after saving the article
                res.redirect(303, "/post");
              });
    }

    } catch (error) {
      console.error("Error handling images:", error);
      res.status(500).send("Internal Server Error");
    }
  // });
});


//Logged-in page: Read Article
router.get('/post/:id?', isAuth.isLoggedIn, (req, res) => {
    const userName = req.session.userFound;
    const postId = req.params.id;
    // console.log(postId);

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
      if(err){
        console.log(`Error retrieving data from post table: ${err.stack}`);
        res.status(500);
      }else{
        if(result.length > 0){
          // Process the result into structured data
          const post = result[0];
          const postComments = result;
          // const postCommentsReplies = result;
          // console.log(postCommentsReplies)

          // const comments = result.filter((comment) => {
          //   comment.comment_id
          // } );

          // const reactions = result.filter((reaction) => reaction.reaction_type);

          // console.log('Comments: ', comments);
          // console.log('Reaction: ', reactions);

          // Retrieve all recent post from posts table joined with users table
          const recentPosts = `SELECT * FROM users, posts WHERE users.id = posts.user_id`;

          db.query(recentPosts, [], (err, row) => {
            if(err){

              console.error('Error retrieving recent posts from posts table: ', err.stack);
              res.status(500);

            }else{

              const totalComment = `SELECT COUNT(*) AS totalComments FROM comments WHERE post_id = ?`;
              
              db.query(totalComment, [postId], (err, commentRows) => {

                if(err){
                  console.error(`Error getting total comments: ${err.stack}`);
                  res.status(500);
                }else{
                  // console.log(commentRows[0]);

                  // console.log(postComments);
              // console.log(reactions);

              // postComments.forEach((comment) =>{
              //   console.log(comment);
              // })

              // for(let comment of postComments){
              //   console.log(comment);
              // }

              res.render('user/post', {
                title: `Article | astablog}`,
                userInfo: userName.username,
                post: result[0], // Pass the post data to the view
                postComments: postComments,
                postCommentsReplies: result,
                reactions: result,
                recentPost: row,
                totalComment: commentRows[0],
                message: req.flash('error'), replyMessage: req.flash('error'),
              });
                }
              })
              
            }
          })

          
        }else{
          res.status(404);
        }
      }
    })

});


//Logged-in page: Comment
router.post('/post/:id?', isAuth.isLoggedIn, (req, res) => {
try {
  const {comment} = req.body;
  const { id } = req.params;
  const user_id = req.session.userFound.id;

  if(!comment){
    console.log('Comment cannot be empty.');
    req.flash('error', 'Comment cannot be empty.');
    res.redirect(`/post/${id}`)

  }else{
    // console.log(comment, id);
    // console.log('User ID: ', user_id);

    const insertComment = `INSERT INTO comments (post_id, user_id, comment) VALUES(?, ?, ?)`;

    db.query(insertComment, [id, user_id, comment], (err, result) => {
      if(err){
        console.error('Error inserting comment into comment table: ', err.stack);
        res.status(500);
      }else{
        console.log(`User with ID ${user_id} has successfully commented on post with ID ${id}`);
        res.redirect(`/post/${id}`)
      }
    })
  }

} catch (error) {
  console.error('Something went wrong', error.stack);
  req.flash('error', 'Something went wrong. Please try again.');
  res.status(500);
}
});


//Logged-in page: Reply to Comment
router.post('/post/:id/reply', isAuth.isLoggedIn, (req, res) => {
  try {

    // console.log(req);

    const {reply_comment, parent_comment_id} = req.body;
    const {id} = req.params; 
    const user_id = req.session.userFound.id;
    console.log('Parent ID: ', parent_comment_id);
    console.log(req.body)
    console.log('Reply Message: ', reply_comment);
    //Check if replay is empty
    if(!reply_comment || !parent_comment_id || !id){
      console.log('Empty reply message. Please write a reply message.');
      // flash('error', 'Empty reply');
      res.redirect(303, `/post/${id}?empty%reply`);
      return;
    }else{

      const replyMessageQuery = `INSERT INTO comments (post_id, user_id, comment, parent_comment_id) VALUE(?, ?, ?, ?)`;

      db.query(replyMessageQuery, [id, user_id, reply_comment, parent_comment_id], (err, result) => {
        if(err){
          console.error('Error inserting reply into comment table', err.stack);
          res.status(500);
          return;
        }else{
                console.log(`User with ID ${user_id} has reply to post with ID ${id} user comment ${parent_comment_id}. Here is the reply: ${reply_comment}`);
                res.redirect(`/post/${id}?reply`);
                return;
        }
      })

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
  console.log('Admin ID: ', userID);
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

          })

        })})
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
      console.log(result);
      res.render("admin/article", {
        title:  "Admin Article List | astaBlog",
        userInfo: result[0],
      });
    })
  }
);

// Admin comments
router.get('/asta-admin/comments', isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {

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
      console.log(result);
      res.render('admin/comments', {
        title:  "Admin Comments List | astaBlog",
        userInfo: result[0],
      });
    })

})

// Admin Replies

router.get('/asta-admin/replies', isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {

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
      console.log(result);
      res.render('admin/replies', {
        title:  "Admin Replies List | astaBlog",
        userInfo: result[0],
      });
    })

})

// Admin users list

router.get('/asta-admin/users', isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {

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
      console.log(result);
      res.render('admin/users', {
        title:  "Admin users List | astaBlog",
        userInfo: result[0],
      });
    })

})

// Admin page Settings

router.get('/asta-admin/settings', isAuth.isLoggedIn, isAdmin.isAdmin, (req, res) => {

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
      console.log(result);
      res.render('admin/settings', {
        title:  "Admin Settings | astaBlog",
        userInfo: result[0],
      });
    })

})

module.exports = router;
