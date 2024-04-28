import { Request, Response } from "./blazu";
import { MaybePromise } from "./util";

export type RouteHandler<Pathname extends `/${string}` = `/${string}`> = (
  req: Request<Pathname>,
  res: Response
) => MaybePromise<void>;

export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RouteHandlers = {
  [method in Methods]?: RouteHandler;
};

type TreeChildren = {
  [path: `/${string}`]: DynamicRoutingTree;
};

type LazyDynamicRoutingTree =
  | { created: false }
  | ({ created: true } & DynamicRoutingTree & { paramName: string });

export type DynamicRoutingTree = {
  handlers: RouteHandlers;
  children: TreeChildren;
  dynamic: LazyDynamicRoutingTree;

  addHandler(method: Methods, handler: RouteHandler): void;
  addChild(path: `/${string}`): void;
  addDynamicChild(paramName: string): void;
};

export const makeDynamicRoutingTree = (): DynamicRoutingTree => {
  let children: TreeChildren = {};
  let handlers: RouteHandlers = {};
  let dynamic: LazyDynamicRoutingTree = { created: false };

  return {
    children,
    handlers,

    addHandler(method: Methods, handler: RouteHandler) {
      this.handlers[method] = handler;
    },
    addChild(path: `/${string}`) {
      this.children[path] = makeDynamicRoutingTree();
    },
    addDynamicChild(paramName: string) {
      if (!this.dynamic.created) {
        this.dynamic = {
          ...makeDynamicRoutingTree(),
          created: true,
          paramName,
        };
      }
    },
    dynamic,
  };
};

export type StaticRoutingTree = {
  handlers: Record<`/${string}`, RouteHandlers>;
  addHandler(path: `/${string}`, method: Methods, handler: RouteHandler): void;
};

export const makeStaticRoutingTree = (): StaticRoutingTree => {
  let handlers: Record<`/${string}`, RouteHandlers> = {};

  function addHandler(
    path: `/${string}`,
    method: Methods,
    handler: RouteHandler
  ) {
    if (!handlers[path]) {
      handlers[path] = {};
    }

    handlers[path][method] = handler;
  }

  return {
    handlers,
    addHandler,
  };
};

export const getRouteHandlerFromStaticRoutingTree = (
  path: `/${string}`,
  method: Methods,
  staticRoutingTree: StaticRoutingTree
) => {
  return staticRoutingTree.handlers[path]?.[method];
};

export const getRouteHandlerFromDynamicRoutingTree = (
  path: `/${string}`,
  method: Methods,
  dynamicRoutingTree: DynamicRoutingTree
) => {
  const segments = path.slice(1).split("/");
  if (segments.at(-1) !== "") segments.push("");

  let currentTree = dynamicRoutingTree;
  const collectedParams: Record<string, string> = {};

  for (const segment of segments) {
    if (segment === "") {
      const handler = currentTree.handlers?.[method];
      return {
        collectedParams,
        handler,
      };
    }

    let newTree = currentTree.children?.[`/${segment}`];
    if (!newTree && currentTree.dynamic.created) {
      newTree = currentTree.dynamic;
      collectedParams[currentTree.dynamic.paramName] = segment;
    }

    if (!newTree) {
      return {
        collectedParams,
        handler: undefined,
      };
    }

    currentTree = newTree;
  }

  return {
    collectedParams,
    handler: undefined,
  };
};

export const insertRouteHandlerIntoDynamicRoutingTree = (
  path: `/${string}`,
  method: Methods,
  dynamicRoutingTree: DynamicRoutingTree,
  handler: RouteHandler
) => {
  const segments = path.slice(1).split("/");
  if (segments.at(-1) !== "") segments.push("");

  let currentTree = dynamicRoutingTree;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (i === segments.length - 1) {
      currentTree.addHandler(method, handler);
      return;
    }

    if (!currentTree.children[`/${segment}`]) {
      if (segment.startsWith(":")) {
        if (!currentTree.dynamic.created) {
          currentTree.addDynamicChild(segment.slice(1));
        }

        currentTree = currentTree.dynamic as DynamicRoutingTree;
      } else {
        currentTree.addChild(`/${segment}`);
        currentTree = currentTree.children[`/${segment}`];
      }
    } else {
      currentTree = currentTree.children[`/${segment}`];
    }
  }
};
