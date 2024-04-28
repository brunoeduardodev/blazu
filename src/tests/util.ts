import events from "events";
import httpMocks from "node-mocks-http";

import { Blazu } from "../lib/blazu";
import { Methods } from "../lib/routing";

export const noop = () => {};

type MockRequestOptions = {
  url: string;
  method: Methods;
  body?: any;
  blazu: Blazu;
};

export const req = async ({ method, url, body, blazu }: MockRequestOptions) => {
  const request = httpMocks.createRequest({
    method: method,
    url: url,
    body: body,
  });

  const response = httpMocks.createResponse({
    req: request,
    eventEmitter: events.EventEmitter,
  });

  const resultPromise = new Promise<{
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: any;
  }>((resolve) => {
    response.on("end", () => {
      resolve({
        statusCode: response._getStatusCode(),
        headers: response._getHeaders(),
        body: response._getJSONData(),
      });
    });
  });

  blazu.handle([request, response]);

  return await resultPromise;
};
