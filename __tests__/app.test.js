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
    expect(response.topics.length).toBeGreaterThan(0); // optional
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

afterAll(() => {
  return db.end();
});