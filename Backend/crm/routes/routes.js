const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import all controller functions from handler
const {
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
} = require("../handlers/handler");

// Auth routes
router.post("/api/login", login);
router.post("/api/signup", signUp);
router.get("/api/logout", logout);

// Profile routes
router.get("/api/profile", requireAuthJWT, getProfile);
const upload = multer({
  storage: require("../handlers/handler").storage, // You'll need to export storage from handler
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});
router.post(
  "/api/profile/update",
  requireAuthJWT, // First authenticate the user
  (req, res, next) => {
    // Then create the multer middleware with access to req.user
    const upload = require("../handlers/handler").setupMulter(req, res);
    upload.single("profilePic")(req, res, next);
  },
  updateProfile
);

// Forum routes
router.get("/api/forums", getForums);
router.get("/api/userForums", requireAuthJWT, getAUserForums);
router.post("/api/forums", requireAuthJWT, postForum);
router.get("/api/forums/:id", requireAuthJWT, getAForumById);
router.get("/api/replies/:id", requireAuthJWT, repliesByForumId);
router.post("/api/forums/:id/edit", requireAuthJWT, editForum);
router.delete("/api/forums/:id", requireAuthJWT, deleteAForum);
router.post("/api/forums/:id/like", requireAuthJWT, likeForum);
router.post("/api/forums/:id/dislike", requireAuthJWT, dislikeForum);

// Reply routes
router.post("/api/forums/:id/reply", requireAuthJWT, replyForum);
router.post(
  "/api/forums/:forumId/replies/:replyId/edit",
  requireAuthJWT,
  editAReply
);
router.delete(
  "/api/forums/:forumId/replies/:replyId",
  requireAuthJWT,
  deleteAReply
);
router.post(
  "/api/forums/:forumId/replies/:replyId/like",
  requireAuthJWT,
  likeReply
);
router.post(
  "/api/forums/:forumId/replies/:replyId/dislike",
  requireAuthJWT,
  dislikeReply
);

module.exports = router;
