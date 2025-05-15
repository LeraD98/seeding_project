const { selectArticleById } = require("../models/articles.model");
const { selectCommentsByArticleId, insertCommentByArticleId } = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
     res.status(400).send({ status: 400, msg: "Bad Request" })
     next();
     return;
  }



selectArticleById(article_id)
  .then((article) => {
    if (!article) {
      return Promise.reject({ status: 404, msg: "Article Not Found" });
    }

    return selectCommentsByArticleId(article_id);
  })
  .then((comments) => {
    res.status(200).send({ comments });
  })
  .catch(next);
}

// task 6 
exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  
  if (!username || !body) {
    return res.status(400).send({ msg: "Bad Request" });
  }

 
  selectArticleById(article_id)
    .then((article) => {
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
     
      return insertCommentByArticleId(article_id, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next); 
};