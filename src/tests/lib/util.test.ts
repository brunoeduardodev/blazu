import { describe, expect, it } from "vitest";

import { ExtractParamsFromString, removeTrailingSlash } from "../../lib/util";

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

describe("removeTrailingSlash", () => {
  it("should remove trailing slash", () => {
    expect(removeTrailingSlash("/test/")).toBe("/test");
  });

  it("should keep string intact in case of no trailing slash", () => {
    expect(removeTrailingSlash("/test")).toBe("/test");
  });

  it("should not remove slash if its the only character", () => {
    expect(removeTrailingSlash("/")).toBe("/");
  });
});

type cases = [
  Expect<Equal<ExtractParamsFromString<"/test">, never>>,
  Expect<Equal<ExtractParamsFromString<"/test/">, never>>,
  Expect<Equal<ExtractParamsFromString<"/test/:test">, "test">>,
  Expect<Equal<ExtractParamsFromString<"/users/:userId">, "userId">>,
  Expect<Equal<ExtractParamsFromString<"/projects/users/:userId">, "userId">>,
  Expect<
    Equal<
      ExtractParamsFromString<"/projects/:projectId/users/:userId">,
      "projectId" | "userId"
    >
  >,
];
