require("dotenv").config();
const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API tests", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("GET, /launches, get the list of launches", () => {
    test("It should return a list of launches", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("POST, /launches, add a new launch", () => {
    const postLaunchData = {
      mission: "Test mission",
      rocket: "Test rocket",
      destination: "Kepler-442 b",
      launchDate: "January 1, 2030",
    };
    const postLaunchDataWithoutDate = {
      mission: "Test mission",
      rocket: "Test rocket",
      destination: "Kepler-442 b",
    };
    const postInvalidLaunchData = {
      mission: "Test mission",
      rocket: "Test rocket",
      destination: "Kepler-442 b",
      launchDate: "Invalid one",
    };

    test("It should return status 201 after new launch posted", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(postLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(postLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(postLaunchDataWithoutDate);
    });

    test("It should return status 400 with missing property error", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(postLaunchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing launch's properties",
      });
    });

    test("It should return status 400 with Invalid launch date error", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(postInvalidLaunchData)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
