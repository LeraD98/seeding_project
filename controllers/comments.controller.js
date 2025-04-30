const { selectArticleById } = require("../models/articles.model");
const { selectCommentsByArticleId } = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
     res.status(400).send({ status: 400, msg: "Bad Request" })
     next();
     return;
  }

  const article = selectArticleById(article_id).catch(() => {
        res.status(404).send({ msg: 'Article Not Found' });
        next();
  });


  selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

