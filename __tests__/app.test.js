const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
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