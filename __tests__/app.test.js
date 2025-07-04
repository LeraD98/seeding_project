const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed(data));

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("responds with status 200", async () => {
    const res = await request(app).get("/api/topics");
    expect(res.status).toBe(200);
  });

  test("responds with an array of topics", async () => {
    const { body } = await request(app).get("/api/topics");
    const response = body;
    expect(response.topics).toBeInstanceOf(Array);
    expect(response.topics.length).toBeGreaterThan(0);
  });

  test("each topic has a slug and description", async () => {
    const { body } = await request(app).get("/api/topics");
    const response = body;
    response.topics.forEach((topic) => {
      expect(topic).toEqual(
        expect.objectContaining({
          slug: expect.any(String),
          description: expect.any(String),
        })
      );
    });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: responds with the correct article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("404: responds with not found for non-existent article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
describe("GET /api/articles", () => {
  test("200: returns an object containing an 'articles' array", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body).toBeInstanceOf(Object);
        expect(body.articles).toBeInstanceOf(Array);
        // Test length here
      });
  });

  test("each article has the correct keys", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });

  test("comment_count is a string representing a number", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(typeof article.comment_count).toBe("string");
          expect(!isNaN(article.comment_count)).toBe(true);
        });
      });
  });

  test("does not include the body property on any article", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });

  test("returns articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const dates = body.articles.map((a) => a.created_at);
        const sortedDates = [...dates].sort(
          (a, b) => new Date(b) - new Date(a)
        );
        expect(dates).toEqual(sortedDates);
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with array of comments for the given article_id, sorted by date desc", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);

        if (body.comments.length > 0) {
          let lastCreatedDate = new Date(body.comments[0].created_at).getTime();

          body.comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: 1,
              })
            );
            const currentDate = new Date(comment.created_at).getTime();
            expect(currentDate).toBeLessThanOrEqual(lastCreatedDate);
            lastCreatedDate = currentDate;
          });
        }
      });
  });

  test("200: responds with an empty array if no comments", () => {
    return db
      .query(
        `SELECT article_id FROM articles WHERE title = 'Test article no comments';`
      )
      .then(({ rows }) => {
        const articleId = rows[0].article_id;

        return request(app)
          .get(`/api/articles/${articleId}/comments`)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("400: responds with 'Bad Request' if invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: responds with 'Article Not Found' if article does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: posts a comment and returns it", () => {
    const newComment = {
      username: "butter_bridge",
      body: "this is a test comment",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            author: "butter_bridge",
            body: "this is a test comment",
            article_id: 1,
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });

  test("400: missing username or body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: article does not exist", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "butter_bridge", body: "test comment" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article or Username Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: increments the vote count", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          votes: 101, // assuming original was 100
        });
      });
  });

  test("200: decrements the vote count", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -50 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          votes: 50, 
        });
      });
  });

  test("400: invalid inc_votes (not a number)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: article not found", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes the comment and returns no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204);
  });

  test("404: comment does not exist", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment Not Found");
      });
  });

  test("400: invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
describe("GET /api/articles (queries)", () => {
  test("200: sorts by 'title'", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const titles = body.articles.map((a) => a.title);
        const sorted = [...titles].sort((a, b) => b.localeCompare(a));
        expect(titles).toEqual(sorted);
      });
  });

  test("200: sorts in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const dates = body.articles.map((a) => new Date(a.created_at));
        const sorted = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sorted);
      });
  });

  test("400: invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=bananas")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort_by column");
      });
  });

  test("400: invalid order", () => {
    return request(app)
      .get("/api/articles?order=sideways")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });
});
test("200: filters articles by topic", () => {
  return request(app)
    .get("/api/articles?topic=mitch")
    .expect(200)
    .then(({ body }) => {
      expect(body.articles.length).toBeGreaterThan(0);
      body.articles.forEach(article => {
        expect(article.topic).toBe("mitch");
      });
    });
});

afterAll(() => {
  return db.end();
});
