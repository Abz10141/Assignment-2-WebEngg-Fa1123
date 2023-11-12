// interactionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');

// POST /api/users/:userId/follow
router.post('/users/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is trying to follow themselves
    if (userToFollow._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if the user is already following the target user
    if (req.user.following.includes(req.params.userId)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    // Follow the user
    req.user.following.push(req.params.userId);
    await req.user.save();

    // Notify the user about the new follower
    const notificationMessage = `${req.user.username} started following you.`;
    userToFollow.notifications.push(notificationMessage);
    await userToFollow.save();

    res.json({ message: 'User followed successfully', user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/feed
router.get('/users/feed', authMiddleware, async (req, res) => {
  try {
    // Get the posts from the users that the current user is following
    const posts = await Post.find({ author: { $in: req.user.following } })
      .sort({ createdAt: 'desc' })
      .populate('author', 'username'); // Populate the 'author' field with 'username'

    res.json({ feed: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/notifications/comments
router.post('/notifications/comments', authMiddleware, async (req, res) => {
  try {
    // Retrieve the user's posts
    const userPosts = await Post.find({ author: req.user._id }, '_id');

    // Retrieve comments on the user's posts
    const comments = await Post.find({ _id: { $in: userPosts.map(post => post._id) } })
      .populate({
        path: 'comments',
        match: { createdAt: { $gt: req.user.lastNotificationCheck || new Date(0) } },
        populate: { path: 'user', select: 'username' },
      });

    // Extract comment notifications
    const commentNotifications = comments.reduce((notifications, post) => {
      post.comments.forEach(comment => {
        if (comment.createdAt > (req.user.lastNotificationCheck || new Date(0))) {
          notifications.push({
            postId: post._id,
            postTitle: post.title,
            commenter: comment.user.username,
            content: comment.content,
            createdAt: comment.createdAt,
          });
        }
      });
      return notifications;
    }, []);

    // Update the lastNotificationCheck timestamp
    req.user.lastNotificationCheck = new Date();
    await req.user.save();

    res.json({ commentNotifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
