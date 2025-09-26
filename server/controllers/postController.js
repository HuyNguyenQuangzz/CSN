const Post = require("../models/Post");

// create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, images, tags } = req.body;
    const post = await Post.create({
      author: req.user.id,
      title,
      content,
      images,
      tags,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get posts (list)
exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update post (author or admin)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await post.remove();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// like / unlike
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    const idx = post.likes.findIndex((u) => u.toString() === req.user.id);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// add comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.comments.push({ user: req.user.id, content });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
