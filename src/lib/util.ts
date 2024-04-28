export type MaybePromise<T> = T | Promise<T>;

export type ExtractParamsFromString<T extends string> =
  T extends `/${infer Segment}`
    ? Segment extends `:${infer SegmentWithParam}`
      ? SegmentWithParam extends `${infer CurrentSegmentParam}/${infer NextSegment}`
        ? CurrentSegmentParam | ExtractParamsFromString<`/${NextSegment}`>
        : SegmentWithParam
      : Segment extends `${string}/${infer NextSegment}`
        ? ExtractParamsFromString<`/${NextSegment}`>
        : never
    : never;

export const removeTrailingSlash = (url: string) => {
  if (url === "/") return url;
  if (url.at(-1) === "/") {
    return url.slice(0, -1);
  }

  return url;
};
