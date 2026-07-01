require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

/* ================= MONGO DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully ✅"))
  .catch((err) => console.log("MongoDB Error ❌:", err.message));

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);

/* ================= MODELS ================= */

// USER (already in auth model, not here)

// POST MODEL
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

// COMMENT MODEL
const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("Blog API is running...");
});

/* ================= POSTS APIs ================= */

// CREATE POST (PROTECTED)
app.post("/api/posts", authMiddleware, async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL POSTS
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= COMMENTS APIs ================= */

// ADD COMMENT (PROTECTED)
app.post("/api/comments", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.create({
      postId: req.body.postId,
      text: req.body.text,
      userId: req.user.id,
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET COMMENTS BY POST ID
app.get("/api/comments/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "username");

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});