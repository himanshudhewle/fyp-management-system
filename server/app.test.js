import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "./app.js";

process.env.JWT_SECRET = "test-secret-with-more-than-thirty-two-characters";

const app = createApp();
let server;
let origin;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("health endpoint reports unavailable until MongoDB is connected", async () => {
  const response = await fetch(`${origin}/api/health`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "database-unavailable" });
});

test("record endpoints require a signed-in user", async () => {
  const response = await fetch(`${origin}/api/records/proposals`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Please sign in to continue." });
});

test("registration validates input before accessing the database", async () => {
  const response = await fetch(`${origin}/api/auth/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.8",
    },
    body: JSON.stringify({ name: "", email: "bad", password: "123", role: "student" }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Enter a valid name, email, password, and role.",
  });
});
