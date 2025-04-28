const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs"); // Missing fs import

const jwt = require("jsonwebtoken");
const JWT_SECRET = "lsfmnsfff";

const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../public/uploads/profiles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use user ID from JWT for more secure filenames
    const userId = req.user.uid;
    cb(null, `user-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const setupMulter = (req, res) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, "../public/uploads/profiles");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Now req.user should be available
      const userId = req.user.uid;
      cb(
        null,
        `user-${userId}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("Only image files are allowed!"), false);
      }
      cb(null, true);
    },
  });
};

// Create the Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

app.use(express.static(path.join(__dirname, "public")));
//can be placed anywhere
app.set("view engine", "ejs");
const {
  insertUser,
  getUserByEmail,
  getUserById,
  updateUser,
  insertForum,
  getAllForums,
  getForumById,
  updateForum,
  deleteForum,
  updateForumLikes,
  updateForumDislikes,
  getRepliesByForumId,
  addReply,
  editReply,
  deleteReply,
  updateReplyLikes,
  updateReplyDislikes,
  getUserForums,
} = require("../public/lib/database");
var bodyParser = require("body-parser");

// Session setup before any route that uses session
app.use(
  session({
    secret: "12345",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Changed to true for nested objects

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Authentication middleware
function requireAuthJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        //most likely token expired
        res.sendStatus(401);
        return;
      }
    });
  } else {
    res.sendStatus(401);
  }
} //end requireAuthJWT

const login = async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await getUserByEmail(email);

  if (!foundUser) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Compare entered password with stored hash
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);

  if (isPasswordCorrect) {
    const userDetails = { uid: foundUser._id };
    const accessToken = jwt.sign(userDetails, JWT_SECRET, { expiresIn: "12h" });
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

const signUp = async (req, res) => {
  try {
    const foundUser = await insertUser(req.body);
    const userDetails = { uid: foundUser._id };
    const accessToken = jwt.sign(userDetails, JWT_SECRET, { expiresIn: "12h" });
    res.json({ accessToken });
  } catch (error) {
    console.error("Signup error:", error); // Log the error
    // Redirect to the signup page with the error message as a query parameter
    res.status(401).json({ message: "Email exists" });
  }
};

const logout = (req, res) => {
  req.session.userId = null;
  res.redirect("/login");
};

const getProfile = async (req, res) => {
  const user = await getUserById(req.user.uid);
  console.log(req.user.uid);
  res.json(user);
};

const updateProfile = async (req, res) => {
  const { email, username, bio } = req.body;

  // Create update object
  const updateData = { email, username, bio };

  // Add profile pic path if uploaded
  if (req.file) {
    // Make sure this path matches how your front-end is accessing the images
    updateData.profilePic = `/uploads/profiles/${req.file.filename}`;
  }

  try {
    // Update user in database
    await updateUser(req.user.uid, updateData);

    // Get updated user data
    const updatedUser = await getUserById(req.user.uid);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const getForums = async (req, res) => {
  const forums = await getAllForums();
  res.status(200).json(forums);
};

const getAUserForums = async (req, res) => {
  const forums = await getUserForums(req.user.uid);
  console.log(req.user.uid);
  res.status(200).json(forums);
};

const postForum = async (req, res) => {
  const { title, discussionBody, tags } = req.body;
  const userId = req.user.uid;
  const user = await getUserById(userId);
  const username = user.username;

  // Parse tags from JSON string to array
  let parsedTags = [];
  try {
    parsedTags = JSON.parse(tags);
  } catch (e) {
    console.error("Error parsing tags:", e);
  }

  const newForum = {
    title,
    discussionBody,
    tags: parsedTags, // Store as actual array
    author: username,
    createdAt: new Date(),
    likes: 0,
    dislikes: 0,
  };

  insertForum(newForum, userId);
  res.status(200).json({ message: "Success" });
};

const editForum = async (req, res) => {
  const id = req.params.id;
  const { title, discussionBody, tags } = req.body;
  const user = await getUserById(req.user.uid);
  const username = user.username;
  // Parse tags from JSON string to array
  let parsedTags = [];
  try {
    parsedTags = JSON.parse(tags);
  } catch (e) {
    console.error("Error parsing tags:", e);
  }

  const newForum = {
    title: title,
    discussionBody: discussionBody,
    tags: parsedTags, // Store as actual array
    author: username,
  };

  updateForum(id, newForum);
  res.status(200).json({ message: "Post updated successfully" });
};

const deleteAForum = async (req, res) => {
  const _id = req.params.id;
  await deleteForum(_id);
  res.status(200).json({ message: "Success deleted forum posts" });
};

const getAForumById = async (req, res) => {
  const _id = req.params.id;
  console.log("triggered");

  // Fetch the forum post from the database using the _id
  const forum = await getForumById(_id);

  res.status(200).json(forum);
};

const likeForum = async (req, res) => {
  const forumId = req.params.id;
  const userId = req.user.uid;

  await updateForumLikes(forumId, userId);
  res.status(200).json({ meesage: "Success like post" });
};

const dislikeForum = async (req, res) => {
  const forumId = req.params.id;
  const userId = req.user.uid;

  await updateForumDislikes(forumId, userId);
  res.status(200).json({ message: "Success disliked post" });
};

// Route to handle replies
const replyForum = async (req, res) => {
  const forumId = req.params.id;
  const { replyText } = req.body;
  const user = await getUserById(req.user.uid);
  const username = user.username;

  // Save the reply to the database
  await addReply(forumId, replyText, req.user.uid, username);

  res.status(200).json({ message: "Successfully Reply Post" });
};

const editAReply = async (req, res) => {
  const { replyId, forumId } = req.params;
  const { replyText } = req.body;
  await editReply(replyId, replyText);
  res.status(200).json({ message: "Success edit reply" });
};

const deleteAReply = async (req, res) => {
  const { replyId, forumId } = req.params;
  await deleteReply(replyId);
  res.status(200).json({ message: "Success delete reply" });
};

const likeReply = async (req, res) => {
  const forumId = req.params.forumId;
  const userId = req.user.uid;
  const replyId = req.params.replyId;

  await updateReplyLikes(replyId, userId);
  res.status(200).json({ message: "Success like reply" });
};

const dislikeReply = async (req, res) => {
  const forumId = req.params.forumId;
  const userId = req.user.uid;
  const replyId = req.params.replyId;

  await updateReplyDislikes(replyId, userId);
  res.status(200).json({ message: "Success dislike reply" });
};

const repliesByForumId = async (req, res) => {
  const id = req.params.id;

  const replies = await getRepliesByForumId(id);
  res.status(200).json(replies);
};

module.exports = {
  login,
  signUp,
  logout,
  getProfile,
  updateProfile,
  getForums,
  postForum,
  editForum,
  deleteAForum,
  getAForumById,
  likeForum,
  dislikeForum,
  replyForum,
  editAReply,
  deleteAReply,
  likeReply,
  dislikeReply,
  repliesByForumId,
  requireAuthJWT,
  setupMulter,
  getAUserForums,
};
