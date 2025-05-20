const express = require('express');
const app = express();
const { getTopics} = require("./controllers/topics.controller");
const { getArticleById, getArticles } = require("./controllers/articles.controller");
const { getCommentsByArticleId, postCommentByArticleId, deleteCommentById} = require("./controllers/comments.controller");
const { patchArticleById } = require("./controllers/articles.controller");
const endpoints = require('./endpoints.json'); 
const cors = require('cors');

app.use(cors());

app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad Request' });
  } else {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
});





module.exports = app;

