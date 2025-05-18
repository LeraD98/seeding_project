const { selectArticleById, selectAllArticles, updateArticleVotes} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
//10 11
  selectAllArticles(sort_by, order, topic)
    .then((articles) => {
      articles.forEach((article) => {
        article.comment_count = article.comment_count.toString();
      });
      res.status(200).send({ articles });
    })
    .catch(next);
};


// 8
exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (typeof inc_votes !== "number") {
    return res.status(400).send({ msg: "Bad Request" });
  }

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

