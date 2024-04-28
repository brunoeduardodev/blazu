type LogLevel = "debug" | "info" | "warn" | "error" | "http";

type LoggerOptions = {
  debug: boolean;
  info: boolean;
  warn: boolean;
  error: boolean;
  http: boolean;
};

export type LoggerPreference = boolean | LoggerOptions;

const defaultLoggerOptions: LoggerOptions = {
  debug: true,
  info: true,
  warn: true,
  error: true,
  http: true,
};

const mutedLoggerOptions: LoggerOptions = {
  debug: false,
  info: false,
  warn: false,
  error: false,
  http: false,
};

const getLoggerOptions = (preferences: LoggerPreference): LoggerOptions => {
  if (typeof preferences === "boolean") {
    return preferences ? defaultLoggerOptions : mutedLoggerOptions;
  }

  return preferences;
};

export const createLogger = (preferences: LoggerPreference = true) => {
  const options = getLoggerOptions(preferences);

  const log = (level: LogLevel, ...args: any[]) => {
    let method = console.log;
    if (level === "error") {
      method = console.error;
    } else if (level === "warn") {
      method = console.warn;
    }

    method(`[${level}]`, ...args);
  };

  const logIfEnabled = (level: LogLevel, ...args: any[]) => {
    if (!options[level]) {
      return;
    }

    log(level, ...args);
  };

  return {
    debug: (...args: any[]) => logIfEnabled("debug", ...args),
    info: (...args: any[]) => logIfEnabled("info", ...args),
    warn: (...args: any[]) => logIfEnabled("warn", ...args),
    error: (...args: any[]) => logIfEnabled("error", ...args),
    http: (...args: any[]) => logIfEnabled("http", ...args),
  };
};
