import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import API from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

/* ================= BLOG HOME ================= */
function BlogHome() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  // CHECK LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // GET POSTS
  const fetchPosts = async () => {
    try {
      const res = await API.get("/api/posts");
      setPosts(res.data);

      res.data.forEach((post) => {
        fetchComments(post._id);
      });
    } catch (err) {
      console.log(err);
    }
  };

  // GET COMMENTS
  const fetchComments = async (postId) => {
    try {
      const res = await API.get(`/api/comments/${postId}`);

      setComments((prev) => ({
        ...prev,
        [postId]: res.data,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // CREATE POST
  const createPost = async () => {
    const newPost = {
      title: "My First Post",
      content: "This is created from frontend",
    };

    try {
      await API.post("/api/posts", newPost);
      alert("Post Created");
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  // ADD COMMENT
  const addComment = async (postId) => {
    try {
      await API.post("/api/comments", {
        postId,
        text: commentText[postId] || "",
      });

      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      fetchComments(postId);
    } catch (err) {
      console.log(err);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="App">
      <h1>Blog Posts</h1>

      {/* TOP BUTTONS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={createPost}>Create Post</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>
          Logout
        </button>
      </div>

      {/* POSTS */}
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: "1px solid black",
              margin: 10,
              padding: 10,
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>Author: {post.author}</small>

            {/* COMMENTS SECTION */}
            <div style={{ marginTop: 10 }}>
              <h4>Comments</h4>

              {(comments[post._id] || []).map((c) => (
                <p key={c._id}>
                  {c.text} - <b>{c.userId?.username}</b>
                </p>
              ))}

              {/* CONTROLLED INPUT */}
              <input
                type="text"
                placeholder="Write comment"
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
              />

              <button onClick={() => addComment(post._id)}>
                Add Comment
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= APP ROUTER ================= */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;