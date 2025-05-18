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
///task 6 
exports.insertCommentByArticleId = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const query = `
    INSERT INTO comments (author, body, article_id)
    VALUES ($1, $2, $3)
    RETURNING comment_id, author, body, article_id, votes, created_at;
  `;

return db
.query(query, [username, body, article_id])
.then((result) => result.rows[0])
.catch((err) => {
  if (err.code === "23503") {
    return Promise.reject({ status: 404, msg: "Article or Username Not Found" });
  }
  return Promise.reject(err);
})
}
//task 7 
exports.insertCommentByArticleId = (article_id, username, body) => {
  const query = `
    INSERT INTO comments (author, body, article_id)
    VALUES ($1, $2, $3)
    RETURNING comment_id, author, body, article_id, votes, created_at;
  `;
  return db
    .query(query, [username, body, article_id])
    .then(({ rows }) => rows[0])
    .catch((err) => {
      if (err.code === "23503") {
        return Promise.reject({ status: 404, msg: "Article or Username Not Found" });
      }
      return Promise.reject(err);
    });
};