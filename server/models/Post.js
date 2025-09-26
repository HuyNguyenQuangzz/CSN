const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    content: String,
    images: [{ url: String, alt: String }],
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
