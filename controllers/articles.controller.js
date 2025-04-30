const { selectArticleById, selectAllArticles } = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};


exports.getArticles = (req, res, next) => {
  selectAllArticles()
    .then((articles) => {
      articles.forEach((article) => {
        article.comment_count = article.comment_count.toString(); //Convert comment_count to string as was returning munber
      });
      res.status(200).send({ articles });
    })
    .catch(next);
};

