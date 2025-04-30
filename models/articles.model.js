const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return result.rows[0];
    });
};
exports.selectAllArticles = () => {
  return db
    .query(`
      SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC; 
    `)
    // ::INT casts the count result to an integer.
    // counts the number of comments for each article using the COUNT()
    // LEFT JOIN ensures that all articles are returned, even if they have no comments.
    // GROUP BY articles.article_id groups the results by article, 
    .then(({ rows }) => {
      return rows;
    });
};