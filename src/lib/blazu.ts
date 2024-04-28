import { createServer, IncomingMessage, ServerResponse } from "http";

import { augmentRequest, augmentResponse } from "./http";
import { createLogger, LoggerPreference } from "./logger";
import {
  getRouteHandlerFromDynamicRoutingTree,
  getRouteHandlerFromStaticRoutingTree,
  insertRouteHandlerIntoDynamicRoutingTree,
  makeDynamicRoutingTree,
  makeStaticRoutingTree,
  Methods,
  RouteHandler,
} from "./routing";
import {
  ExtractParamsFromString,
  MaybePromise,
  removeTrailingSlash,
} from "./util";

type AppOptions = {
  logger: LoggerPreference;
};

const defaultAppOptions: AppOptions = {
  logger: true,
};

export type RequestObject = IncomingMessage;

export type Request<Pathname extends `/${string}`> = IncomingMessage & {
  params: Record<ExtractParamsFromString<Pathname>, string>;
};

export type Response = ServerResponse<IncomingMessage> & {
  json(data: any): void;
  status(code: number): Response;

  _hasSetStatusCode: boolean;
};

export type ResponseObject = ServerResponse<IncomingMessage>;
type NextFunction = () => void;
type ListenCallback = (port: number, hostname: string) => void;

type MiddlewareHandler = (
  req: RequestObject,
  res: ResponseObject,
  next: NextFunction
) => MaybePromise<void>;

export const createBlazu = (options = defaultAppOptions) => {
  const logger = createLogger(options.logger);
  const middlewares: MiddlewareHandler[] = [];
  const routingTree = makeDynamicRoutingTree();
  const staticRoutingTree = makeStaticRoutingTree();

  const onNotFound = (res: ResponseObject) => {
    res.statusCode = 404;
    res.statusMessage = "Not Found";
    res.end();
  };

  const passRequestToRouter = (req: RequestObject, res: ResponseObject) => {
    if (!req.url) return;
    let url = removeTrailingSlash(req.url) as `/${string}`;
    const method = req.method as Methods;

    const staticRouteHandler = getRouteHandlerFromStaticRoutingTree(
      url,
      method,
      staticRoutingTree
    );

    if (staticRouteHandler) {
      staticRouteHandler(augmentRequest(req, {}), augmentResponse(res));
      return;
    }

    const { collectedParams, handler: dynamicRouteHandler } =
      getRouteHandlerFromDynamicRoutingTree(url, method, routingTree);

    if (dynamicRouteHandler) {
      dynamicRouteHandler(
        augmentRequest(req, { params: collectedParams }),
        augmentResponse(res)
      );
      return;
    }

    onNotFound(res);
  };

  const walkRequestThroughMiddlewares = (
    req: RequestObject,
    res: ResponseObject,
    index: number
  ) => {
    if (index < middlewares.length) {
      middlewares[index](req, res, () =>
        walkRequestThroughMiddlewares(req, res, index + 1)
      );
    } else {
      passRequestToRouter(req, res);
    }
  };

  const handleRequest = (req: RequestObject, res: ResponseObject) => {
    logger.http(`${req.method} ${req.url}`);
    walkRequestThroughMiddlewares(req, res, 0);
  };

  const registerRoute = (
    method: Methods,
    path: `/${string}`,
    handler: RouteHandler
  ) => {
    if (!path.includes(":")) {
      staticRoutingTree.addHandler(path, method, handler);
      return;
    }

    insertRouteHandlerIntoDynamicRoutingTree(
      path,
      method,
      routingTree,
      handler
    );
  };

  return {
    listen(
      port: number,
      hostnameOrCallback?: string | ListenCallback,
      callback?: ListenCallback
    ) {
      const server = createServer(handleRequest);

      const hostname =
        typeof hostnameOrCallback === "string"
          ? hostnameOrCallback
          : "localhost";

      const listenCallback =
        typeof hostnameOrCallback === "function"
          ? hostnameOrCallback
          : callback;

      server.listen(port, hostname, () => {
        listenCallback?.(port, hostname);
        logger.info(`Server listening on http://${hostname}:${port}`);
      });
    },
    use(middleware: MiddlewareHandler) {
      middlewares.push(middleware);
      return this;
    },
    get<Pathname extends `/${string}`>(
      path: Pathname,
      handler: RouteHandler<Pathname>
    ) {
      registerRoute("GET", path, handler);
      return this;
    },
    post<Pathname extends `/${string}`>(
      path: Pathname,
      handler: RouteHandler<Pathname>
    ) {
      registerRoute("POST", path, handler);
      return this;
    },
    put<Pathname extends `/${string}`>(
      path: Pathname,
      handler: RouteHandler<Pathname>
    ) {
      registerRoute("PUT", path, handler);
      return this;
    },
    patch<Pathname extends `/${string}`>(
      path: Pathname,
      handler: RouteHandler<Pathname>
    ) {
      registerRoute("PATCH", path, handler);
      return this;
    },
    delete<Pathname extends `/${string}`>(
      path: Pathname,
      handler: RouteHandler<Pathname>
    ) {
      registerRoute("DELETE", path, handler);
      return this;
    },
  };
};
