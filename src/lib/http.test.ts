import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { describe, expect, it, vitest } from "vitest";

import { augmentRequest, augmentResponse } from "./http";

describe("request augmentation", () => {
  it("should add params to request", () => {
    const req = {
      url: "/test/123",
      method: "GET",
    } as IncomingMessage;

    const augmentedReq = augmentRequest(req, { params: { test: "123" } });

    expect(augmentedReq.params).toStrictEqual({ test: "123" });
  });
});

describe("response augmentation", () => {
  it("should send stringified json and end response when using .json()", () => {
    const _req = new IncomingMessage(new Socket());
    const _res = new ServerResponse(_req);
    const res = augmentResponse(_res);

    const _resEnd = vitest.spyOn(_res, "end");
    const _resWrite = vitest.spyOn(_res, "write");

    res.json({ test: "123" });

    expect(_res.statusCode).toBe(200);
    expect(_res.getHeader("Content-Type")).toBe("application/json");
    expect(_resEnd).toHaveBeenCalledOnce();
    expect(_resWrite).toHaveBeenCalledOnce();
    expect(_resWrite).toHaveBeenCalledWith('{"test":"123"}');
  });

  it("should add statusCode to response when using json method, when no statusCode is provided", () => {
    const _req = new IncomingMessage(new Socket());
    const _res = new ServerResponse(_req);
    const res = augmentResponse(_res);

    res.json({ test: "123" });
    expect(_res.statusCode).toBe(200);
  });
});
