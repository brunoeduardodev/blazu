import { describe, expect, it } from "vitest";

import {
  getRouteHandlerFromDynamicRoutingTree,
  getRouteHandlerFromStaticRoutingTree,
  insertRouteHandlerIntoDynamicRoutingTree,
  makeDynamicRoutingTree,
  makeStaticRoutingTree,
} from "./routing";

describe("static routing tree", () => {
  it("should be defined", () => {
    const staticRoutingTree = makeStaticRoutingTree();
    expect(staticRoutingTree).toBeDefined();
  });

  it("should be able to add a handler", () => {
    const staticRoutingTree = makeStaticRoutingTree();
    staticRoutingTree.addHandler("/test", "GET", () => {});

    expect(staticRoutingTree.handlers["/test"]?.["GET"]).toBeDefined();
  });

  it("should be able to add a root handler", () => {
    const staticRoutingTree = makeStaticRoutingTree();
    staticRoutingTree.addHandler("/", "GET", () => {});
    expect(staticRoutingTree.handlers["/"]?.["GET"]).toBeDefined();
    expect(
      getRouteHandlerFromStaticRoutingTree("/", "GET", staticRoutingTree)
    ).toBeDefined();
  });

  it("should be able to get a handler", () => {
    const staticRoutingTree = makeStaticRoutingTree();
    staticRoutingTree.addHandler("/test", "GET", () => {});
    expect(
      getRouteHandlerFromStaticRoutingTree("/test", "GET", staticRoutingTree)
    ).toBe(staticRoutingTree.handlers["/test"]?.["GET"]);
  });

  it("should be able to get a handler from a nested path", () => {
    const staticRoutingTree = makeStaticRoutingTree();
    staticRoutingTree.addHandler("/test", "GET", () => {});
    staticRoutingTree.addHandler("/test/test2", "POST", () => {});
    expect(
      getRouteHandlerFromStaticRoutingTree(
        "/test/test2",
        "POST",
        staticRoutingTree
      )
    ).toBe(staticRoutingTree.handlers["/test/test2"]?.["POST"]);
  });
});

describe("dynamic routing tree", () => {
  it("should be defined", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    expect(dynamicRoutingTree).toBeDefined();
  });

  it("should be able to add a handler", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addHandler("GET", () => {});
    expect(dynamicRoutingTree.handlers["GET"]).toBeDefined();
  });

  it("should be able to add nested path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addChild("/test");
    expect(dynamicRoutingTree.children["/test"]).toBeDefined();
  });

  it("should be able to add handlers to nested path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addChild("/test");
    dynamicRoutingTree.children["/test"].addHandler("GET", () => {});
    expect(dynamicRoutingTree.children["/test"].handlers["GET"]).toBeDefined();
  });

  it("should be able to add dynamic child", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addDynamicChild("test");
    expect(dynamicRoutingTree.dynamic.created).toBe(true);
    if (!dynamicRoutingTree.dynamic.created)
      throw new Error("dynamic should be created");

    expect(dynamicRoutingTree.dynamic.paramName).toBe("test");
  });

  it("should be able to get a handler from a dynamic path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addDynamicChild("user");
    if (!dynamicRoutingTree.dynamic.created)
      throw new Error("dynamic should be created");
    dynamicRoutingTree.dynamic.addHandler("GET", () => {});

    expect(
      getRouteHandlerFromDynamicRoutingTree("/123", "GET", dynamicRoutingTree)
        ?.handler
    ).toBe(dynamicRoutingTree.dynamic.handlers["GET"]);
  });

  it("should be able to get collected params from a dynamic path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addDynamicChild("user");
    if (!dynamicRoutingTree.dynamic.created)
      throw new Error("dynamic should be created");
    dynamicRoutingTree.dynamic.addHandler("GET", () => {});

    expect(
      getRouteHandlerFromDynamicRoutingTree("/123", "GET", dynamicRoutingTree)
        ?.collectedParams
    ).toEqual({ user: "123" });
  });

  it("should be able to get a handler from a nested dynamic path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    dynamicRoutingTree.addChild("/projects");

    expect(dynamicRoutingTree.children["/projects"]).toBeDefined();

    dynamicRoutingTree.children["/projects"].addDynamicChild("projectId");
    if (!dynamicRoutingTree.children["/projects"].dynamic.created) {
      throw new Error("dynamic should be created");
    }

    dynamicRoutingTree.children["/projects"].dynamic.addChild("/users");
    dynamicRoutingTree.children["/projects"].dynamic.children[
      "/users"
    ].addHandler("GET", () => {});

    const getResult = getRouteHandlerFromDynamicRoutingTree(
      "/projects/1234/users",
      "GET",
      dynamicRoutingTree
    );

    expect(getResult?.handler).toBe(
      dynamicRoutingTree.children["/projects"].dynamic.children["/users"]
        .handlers["GET"]
    );

    expect(getResult?.collectedParams).toStrictEqual({
      projectId: "1234",
    });

    dynamicRoutingTree.children["/projects"].dynamic.children[
      "/users"
    ].addDynamicChild("userId");
    if (
      !dynamicRoutingTree.children["/projects"].dynamic.children["/users"]
        .dynamic.created
    ) {
      throw new Error("dynamic should be created");
    }
    dynamicRoutingTree.children["/projects"].dynamic.children[
      "/users"
    ].dynamic.addHandler("GET", () => {});

    const getResult2 = getRouteHandlerFromDynamicRoutingTree(
      "/projects/1234/users/5678",
      "GET",
      dynamicRoutingTree
    );

    expect(getResult2?.handler).toBe(
      dynamicRoutingTree.children["/projects"].dynamic.children["/users"]
        .dynamic.handlers["GET"]
    );

    expect(getResult2?.collectedParams).toStrictEqual({
      projectId: "1234",
      userId: "5678",
    });
  });

  it("should be able to insert a handler into a dynamic path", () => {
    const dynamicRoutingTree = makeDynamicRoutingTree();
    insertRouteHandlerIntoDynamicRoutingTree(
      "/projects/:projectId/users/:userId",
      "GET",
      dynamicRoutingTree,
      () => {}
    );

    const getResult = getRouteHandlerFromDynamicRoutingTree(
      "/projects/1234/users/5678",
      "GET",
      dynamicRoutingTree
    );
    expect(getResult?.handler).toBeDefined();
    expect(getResult?.collectedParams).toStrictEqual({
      projectId: "1234",
      userId: "5678",
    });
  });
});
