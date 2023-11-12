// postRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post');

// POST /api/posts
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Create a new post
    const post = new Post({ title, content, author: req.user.userId });
    await post.save();

    res.json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/posts
router.get('/posts', async (req, res) => {
  try {
    // Implement pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Implement sorting and filtering options
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    const filter = {}; // Implement filters as needed

    const posts = await Post.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip);

    res.json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/posts/:postId
router.get('/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/posts/:postId
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Update the post
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/posts/:postId
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Delete the post
    await post.remove();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/posts/:postId/rate
router.post('/posts/:postId/rate', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already rated the post
    if (post.ratingUsers && post.ratingUsers.includes(req.user.userId)) {
      return res.status(400).json({ error: 'You have already rated this post' });
    }

    // Update the rating
    post.rating += req.body.rating || 1;
    post.ratingUsers.push(req.user.userId);
    await post.save();

    res.json({ message: 'Rating added successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/posts/:postId/comment
router.post('/posts/:postId/comment', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add the user's comment
    post.comments.push({ user: req.user.userId, content: req.body.content });
    await post.save();

    res.json({ message: 'Comment added successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
