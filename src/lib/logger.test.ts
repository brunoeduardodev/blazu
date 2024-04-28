import { afterAll, describe, expect, it, vitest } from "vitest";

import { createLogger } from "./logger";

const noop = () => {};

describe("logger", () => {
  const consoleLogMock = vitest.spyOn(console, "log").mockImplementation(noop);
  const consoleWarnMock = vitest
    .spyOn(console, "warn")
    .mockImplementation(noop);
  const consoleErrorMock = vitest
    .spyOn(console, "error")
    .mockImplementation(noop);

  afterAll(() => {
    consoleLogMock.mockReset();
    consoleWarnMock.mockReset();
    consoleErrorMock.mockReset();
  });

  it("should create a logger instance", () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
  });

  it("should have all methods defined", () => {
    const logger = createLogger();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.http).toBeDefined();
  });

  it("should log by default", () => {
    const logger = createLogger();
    logger.debug("test");
    logger.info("test1");
    logger.warn("test2");
    logger.error("test3");
    logger.http("test4");

    expect(consoleLogMock).toHaveBeenCalledTimes(3);
    expect(consoleWarnMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("[debug]", "test");
    expect(console.log).toHaveBeenCalledWith("[info]", "test1");
    expect(console.log).toHaveBeenCalledWith("[http]", "test4");
    expect(console.warn).toHaveBeenCalledWith("[warn]", "test2");
    expect(console.error).toHaveBeenCalledWith("[error]", "test3");
  });
});
