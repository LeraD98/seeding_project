const express = require('express');
const app = express();
const endpoints = require('./endpoints.json'); 
app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});


module.exports = app;