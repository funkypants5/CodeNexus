const { MongoClient, ObjectId } = require("mongodb");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

let client = null;

//this is the collection object for querying the
//customers collection in the database
let collectionUsers = null;
let collectionForum = null;
let collectionReplies = null;

//function to connect to db and get the collection object
async function initDBIfNecessary() {
  if (!client) {
    //only connect to the database if we are not already connected
    client = await MongoClient.connect("mongodb://localhost:27017");

    const db = client.db("crm");
    collectionUsers = db.collection("users");

    collectionForum = db.collection("forums");

    collectionReplies = db.collection("replies");
  }
} // end initDBIfNecessary

//function to disconnect from the database
async function disconnect() {
  if (client) {
    await client.close();
    client = null;
  }
} //end disconnect

async function insertUser(user) {
  await initDBIfNecessary();

  const existingUser = await collectionUsers.findOne({ email: user.email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  user.password = hashedPassword;

  user.created = new Date();

  await collectionUsers.insertOne(user);

  // Return user data (without the password ideally)
  const savedUser = await collectionUsers.findOne({
    email: user.email,
  });

  if (savedUser) {
    delete savedUser.password; // Don't return hashed password
  }

  return savedUser;
}

async function getUserByEmail(email) {
  await initDBIfNecessary();

  return collectionUsers.findOne({
    email: email,
  });
}

async function getUserById(id) {
  await initDBIfNecessary();

  return collectionUsers.findOne({
    _id: ObjectId.createFromHexString(id),
  });
}

async function updateUser(id, user) {
  await initDBIfNecessary();

  // Create an update object with only the fields that are present
  const updateObj = {};

  // Add each field to the update object if it exists in the user object
  if (user.username !== undefined) updateObj.username = user.username;
  if (user.email !== undefined) updateObj.email = user.email;
  if (user.bio !== undefined) updateObj.bio = user.bio;
  if (user.profilePic !== undefined) updateObj.profilePic = user.profilePic;

  await collectionUsers.updateOne(
    {
      _id: ObjectId.createFromHexString(id),
    },
    {
      $set: updateObj,
    }
  );
}

async function updateForum(id, forum) {
  await initDBIfNecessary();
  const { title, discussionBody, tags, author } = forum;
  await collectionForum.updateOne(
    {
      _id: ObjectId.createFromHexString(id),
    },
    {
      $set: {
        title,
        discussionBody,
        tags,
        author,
      },
    }
  );
}

async function insertForum(forum, userId) {
  await initDBIfNecessary();
  forum.created = new Date();
  forum.createdBy = userId;
  await collectionForum.insertOne(forum);
}

async function getAllForums() {
  await initDBIfNecessary();
  return collectionForum.find().toArray();
} //end getAllForums

async function getUserForums(userId) {
  await initDBIfNecessary();
  return collectionForum.find({ createdBy: userId }).toArray();
} //end getAllForums

async function getForumById(id) {
  await initDBIfNecessary();

  return collectionForum.findOne({
    _id: ObjectId.createFromHexString(id),
  });
}

async function deleteForum(id) {
  await initDBIfNecessary();
  await collectionForum.deleteOne({
    _id: ObjectId.createFromHexString(id), //this line converts the string (customerId) to a datatype mongodb can identify hence objectId.createFromHexString
  });
} //end deleteCustomer
//export the functions so they can be used in other files

async function updateForumLikes(forumId, userId) {
  await initDBIfNecessary();

  const forum = await collectionForum.findOne({
    _id: ObjectId.createFromHexString(forumId),
  });

  if (!forum) return;

  const hasLiked = forum.likedBy?.includes(userId);
  const hasDisliked = forum.dislikedBy?.includes(userId);

  let updateQuery = {};

  if (hasLiked) {
    // Remove like
    updateQuery = {
      $inc: { likes: -1 },
      $pull: { likedBy: userId },
    };
  } else {
    // Add like, remove dislike if it exists
    updateQuery = {
      $inc: { likes: 1, dislikes: hasDisliked ? -1 : 0 },
      $addToSet: { likedBy: userId },
      $pull: { dislikedBy: userId },
    };
  }

  await collectionForum.updateOne(
    { _id: ObjectId.createFromHexString(forumId) },
    updateQuery
  );
}

async function updateForumDislikes(forumId, userId) {
  await initDBIfNecessary();

  const forum = await collectionForum.findOne({
    _id: ObjectId.createFromHexString(forumId),
  });

  if (!forum) return;

  const hasLiked = forum.likedBy?.includes(userId);
  const hasDisliked = forum.dislikedBy?.includes(userId);

  let updateQuery = {};

  if (hasDisliked) {
    // Remove dislike
    updateQuery = {
      $inc: { dislikes: -1 },
      $pull: { dislikedBy: userId },
    };
  } else {
    // Add dislike, remove like if it exists
    updateQuery = {
      $inc: { dislikes: 1, likes: hasLiked ? -1 : 0 },
      $addToSet: { dislikedBy: userId },
      $pull: { likedBy: userId },
    };
  }

  await collectionForum.updateOne(
    { _id: ObjectId.createFromHexString(forumId) },
    updateQuery
  );
}

async function addReply(forumId, replyText, userId, username) {
  await initDBIfNecessary();

  // Add reply to the database
  await collectionReplies.insertOne({
    forumId: ObjectId.createFromHexString(forumId),
    userId: userId,
    username: username,
    replyText,
    createdAt: new Date(),
  });
}

async function getRepliesByForumId(forumId) {
  await initDBIfNecessary();

  // Fetch replies for a specific forum post
  return await collectionReplies
    .find({ forumId: ObjectId.createFromHexString(forumId) })
    .toArray();
}

async function editReply(replyId, replyText) {
  await initDBIfNecessary();

  // Update only if the user is the owner of the reply
  await collectionReplies.updateOne(
    { _id: ObjectId.createFromHexString(replyId) },
    { $set: { replyText } }
  );
}

async function deleteReply(id) {
  await initDBIfNecessary();
  await collectionReplies.deleteOne({
    _id: ObjectId.createFromHexString(id), //this line converts the string (customerId) to a datatype mongodb can identify hence objectId.createFromHexString
  });
}

async function updateReplyLikes(replyId, userId) {
  await initDBIfNecessary();

  const reply = await collectionReplies.findOne({
    _id: ObjectId.createFromHexString(replyId),
  });

  if (!reply) return;

  const hasLiked = reply.likedBy?.includes(userId);
  const hasDisliked = reply.dislikedBy?.includes(userId);

  let updateQuery = {};

  if (hasLiked) {
    // Remove like
    updateQuery = {
      $inc: { likes: -1 },
      $pull: { likedBy: userId },
    };
  } else {
    // Add like, remove dislike if it exists
    updateQuery = {
      $inc: { likes: 1, dislikes: hasDisliked ? -1 : 0 },
      $addToSet: { likedBy: userId },
      $pull: { dislikedBy: userId },
    };
  }

  await collectionReplies.updateOne(
    { _id: ObjectId.createFromHexString(replyId) },
    updateQuery
  );
}

async function updateReplyDislikes(replyId, userId) {
  await initDBIfNecessary();

  const reply = await collectionReplies.findOne({
    _id: ObjectId.createFromHexString(replyId),
  });

  if (!reply) return;

  const hasLiked = reply.likedBy?.includes(userId);
  const hasDisliked = reply.dislikedBy?.includes(userId);

  let updateQuery = {};

  if (hasDisliked) {
    // Remove like
    updateQuery = {
      $inc: { dislikes: -1 },
      $pull: { dislikedBy: userId },
    };
  } else {
    // Add like, remove dislike if it exists
    updateQuery = {
      $inc: { dislikes: 1, likes: hasLiked ? -1 : 0 },
      $addToSet: { dislikedBy: userId },
      $pull: { likedBy: userId },
    };
  }

  await collectionReplies.updateOne(
    { _id: ObjectId.createFromHexString(replyId) },
    updateQuery
  );
}

module.exports = {
  insertUser,
  disconnect,
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
};
