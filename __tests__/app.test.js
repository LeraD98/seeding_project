const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
/* Set up your beforeEach & afterAll functions here */

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

describe('GET /api/topics', () => {
  let response;

  beforeAll(async () => {
    const { body } = await request(app).get('/api/topics');
    response = body;
  });

  test('responds with status 200', async () => {
    const res = await request(app).get('/api/topics');
    expect(res.status).toBe(200);
  });

  test('responds with an array of topics', () => {
    expect(response.topics).toBeInstanceOf(Array);
    expect(response.topics.length).toBeGreaterThan(0); 
  });

  test('each topic has a slug and description', () => {
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
        const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
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
        let lastCreatedDate;
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
          expect(comment.created_at).toBeLessThan(lastCreatedDate)
          lastCreatedDate = comment.created_at;
        });
      });
  });

  test("200: responds with an empty array if no comments", () => {
    return request(app)
      .get("/api/articles/1/comments") 
      .expect(200)
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
afterAll(() => {
  return db.end();
});