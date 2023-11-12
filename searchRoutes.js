// searchRoutes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/search
router.get('/search', async (req, res) => {
  try {
    const { keywords, categories, authors, sortBy, sortOrder } = req.query;

    // Build the filter object based on the provided parameters
    const filter = {};
    if (keywords) {
      const keywordRegex = new RegExp(keywords, 'i');
      filter.$or = [{ title: keywordRegex }, { content: keywordRegex }];
    }
    if (categories) {
      filter.categories = { $in: categories.split(',') };
    }
    if (authors) {
      const authorIds = await User.find({ username: { $in: authors.split(',') } }, '_id');
      filter.author = { $in: authorIds };
    }

    // Build the sort object based on the provided parameters
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute the search query
    const searchResults = await Post.find(filter)
      .sort(sort)
      .populate('author', 'username');

    res.json({ searchResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dynamic GET request:
// GET /api/search?keywords=programming&categories=tech&authors=user1,user2&sortBy=createdAt&sortOrder=desc
// This will search for blog posts containing the keyword "programming" in their title or content, belonging to the category "tech," and written by the authors with usernames "user1" or "user2." The results will be sorted by creation date in descending order.

module.exports = router;
