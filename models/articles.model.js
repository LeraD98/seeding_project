const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const queryStr = `
    SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
  `;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article Not Found" });
    }
    return rows[0];
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

    .then(({ rows }) => {
      return rows;
    });
};

//8
exports.updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
    `,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};
//10
exports.selectAllArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBy = [
    "author", "title", "article_id", "topic", "created_at", "votes", "article_img_url"
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by column" });
  }

  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const queryValues = [];
  let queryStr = `
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
  `;

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};
  `;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};
