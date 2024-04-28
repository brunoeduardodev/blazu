import { IncomingMessage, ServerResponse } from "http";

import { Request, Response, ResponseObject } from "./blazu";

type AugmentedFields = {
  params?: Record<string, string>;
};

export const augmentRequest = (
  _req: IncomingMessage,
  { params }: AugmentedFields
): Request => {
  const req = _req as Request;
  req.params = params || {};

  return req;
};

export const augmentResponse = (
  _res: ServerResponse<IncomingMessage>
): Response => {
  const res = _res as Response;
  res.json = (data: any) => {
    if (!res._hasSetStatusCode) {
      res.status(200);
    }

    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(data));
    res.end();
  };

  res.status = (code: number) => {
    res.statusCode = code;
    res._hasSetStatusCode = true;

    return res;
  };

  return res;
};
