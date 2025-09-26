const express = require("express");
const router = express.Router();
const postCtrl = require("../controllers/postController");
const auth = require("../middleware/authMiddleware");

router.get("/", postCtrl.listPosts);
router.get("/:id", postCtrl.getPost);
router.post("/", auth, postCtrl.createPost);
router.put("/:id", auth, postCtrl.updatePost);
router.delete("/:id", auth, postCtrl.deletePost);

router.post("/:id/like", auth, postCtrl.toggleLike);
router.post("/:id/comment", auth, postCtrl.addComment);

module.exports = router;
