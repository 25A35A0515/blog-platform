const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// ADD COMMENT
router.post("/", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    const comment = new Comment({
      postId,
      userId,
      text,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET COMMENTS FOR A POST
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;