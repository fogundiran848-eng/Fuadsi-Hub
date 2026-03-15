const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

// MongoDB connection setup
const dbURI = 'your_mongo_db_connection_string';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User authentication routes
app.post('/api/auth/register', (req, res) => {
    // Registration logic here
});
"dependencies": {
  "express": "^4.18.2",
  "mongoose": "^7.0.0"
}
app.post('/api/auth/login', (req, res) => {
    // Login logic here
});

// Posts routes
app.get('/api/posts', (req, res) => {
    // Get all posts logic here
});

app.post('/api/posts', (req, res) => {
    // Create a new post logic here
});

// Comments routes
app.get('/api/comments/:postId', (req, res) => {
    // Get comments for a specific post logic here
});

app.post('/api/comments', (req, res) => {
    // Create a new comment logic here
});

// Likes routes
app.post('/api/posts/:postId/like', (req, res) => {
    // Logic to like a post here
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});