const express = require('express');
const app = express();
const { getTopics } = require("./controllers/topics.controller");
const endpoints = require('./endpoints.json'); 
app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});
app.get("/api/topics", getTopics);

module.exports = app;