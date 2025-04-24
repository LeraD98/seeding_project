const db = require("../connection")

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`DROP TABLE IF EXISTS comments, articles, users, topics CASCADE;`)
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR PRIMARY KEY,
          description VARCHAR,
          img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
        username VARCHAR PRIMARY KEY,
        name VARCHAR,
        avatar_url VARCHAR(1000)
        );
        `)
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
         article_id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          topic VARCHAR REFERENCES topics(slug),
          author VARCHAR REFERENCES users(username),
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000)
        );
        `)
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES articles(article_id),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          author VARCHAR REFERENCES users(username),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
    })
    .then(() => {
      const formattedTopics = topicData.map(topic => {
        return {
          slug: topic.slug,
          description: topic.description,
          img_url: topic.img_url || null
        };
      });
      const topicInsertPromises = formattedTopics.map(topic => {
        return db.query(`
          INSERT INTO topics (slug, description, img_url)
          VALUES ($1, $2, $3)
          RETURNING *;`
        , [topic.slug, topic.description, topic.img_url]);
      });
      return Promise.all(topicInsertPromises);
    })
    .then(() => {
      const formattedUsers = userData.map(user => {
        return {
          username: user.username,
          name: user.name,
          avatar_url: user.avatar_url || null
        };
      });
      const userInsertPromises = formattedUsers.map(user => {
        return db.query(`
          INSERT INTO users (username, name, avatar_url)
          VALUES ($1, $2, $3)
          RETURNING *;
        `, [user.username, user.name, user.avatar_url]);
      });
      return Promise.all(userInsertPromises);
    })
    .then(() => {
      {
        const articleInsertPromises = articleData.map(article => {
          return db.query(
            `INSERT INTO articles
             (title, topic, author, body, created_at, votes, article_img_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *;`,
            [
              article.title,
              article.topic,
              article.author,
              article.body,
              new Date(article.created_at).toISOString(),
              // had a 'error date/time field value out of range' out of range 
              article.votes || 0,
              article.article_img_url || null
            ]
          );
        });
        return Promise.all(articleInsertPromises);
      };
    })
    .then(() => {
      {
        const commentInsertPromises = commentData.map(comment => {
          return db.query(
            `INSERT INTO comments
             (article_id, body, votes, author, created_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *;`,
            [
              comment.article_id,
              comment.body,
              comment.votes || 0,
              comment.author,
              new Date(comment.created_at).toISOString()
            ]
          );
        });
        return Promise.all(commentInsertPromises);
      };
    })
};

module.exports = seed;
