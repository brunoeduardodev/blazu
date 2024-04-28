import { beforeEach, describe, expect, it, vitest } from "vitest";

import { Blazu, createBlazu } from "../../lib/blazu";
import { noop, req } from "../util";

describe("blazu", () => {
  let blazu: Blazu;
  beforeEach(() => {
    blazu?.stop();
    blazu = createBlazu();
  });

  it("should answer a request", async () => {
    blazu.get("/", (req, res) => {
      res.json({ message: "Hello World!" });
    });

    const { body, statusCode } = await req({
      method: "GET",
      url: "/",
      blazu,
    });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ message: "Hello World!" });
  });

  it("should answer a request with dynamic path", async () => {
    const blazu = createBlazu();
    blazu.get("/users/:userId", (req, res) => {
      res.json({ message: "Hello World!", userId: req.params.userId });
    });

    const { body, statusCode } = await req({
      method: "GET",
      url: "/users/123",
      blazu,
    });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ message: "Hello World!", userId: "123" });
  });

  it("should pass through all middlewares", async () => {
    blazu = createBlazu({ logger: false });
    blazu.use((req, res, next) => {
      res.setHeader("x-middleware-1", "middleware1");
      next();
    });

    blazu.use((req, res, next) => {
      res.setHeader("x-middleware-2", "middleware2");
      next();
    });

    blazu.get("/", (req, res) => {
      res.json({ message: "Hello World!" });
    });

    const res = await req({
      method: "GET",
      url: "/",
      blazu,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ message: "Hello World!" });
    expect(res.headers["x-middleware-1"]).toBe("middleware1");
    expect(res.headers["x-middleware-2"]).toBe("middleware2");
  });
});
