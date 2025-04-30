const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
  if (isNaN(Number(article_id))) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  return db
    .query(
      `SELECT comment_id, votes, created_at, author, body, article_id
       FROM comments
       WHERE article_id = $1
       ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};