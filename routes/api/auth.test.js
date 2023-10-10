const req = require("supertest");
const app = require("../../app");

describe("Login Controller", () => {
  test("should return status 200, token, and user object with email and subscription fields", async () => {
    const user = {
      email: "avatar@ddd.oi",
      password: "1111",
    };

    const res = await req(app).post("/api/users/login").send(user);

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty("token");

    expect(res.body).toHaveProperty("user");
    expect(typeof res.body.user.email).toBe("string");
    expect(typeof res.body.user.subscription).toBe("string");
  });
});
