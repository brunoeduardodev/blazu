import { serialize_json } from "../..";
import fs from "fs";
import path from "path";

const content = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "blazu_5mb.json"),
  "utf-8"
);

export const run = () => {
  console.time("json parse");
  JSON.parse(content);
  console.timeEnd("json parse");

  console.time("serialize_json");
  serialize_json(content);
  console.timeEnd("serialize_json");
};

run();
