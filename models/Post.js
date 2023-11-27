// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  ratingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have rated the post
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
