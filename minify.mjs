import { readFileSync } from "fs";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node minify.mjs <script or file.lua>");
  process.exit(1);
}

let script;
try {
  script = readFileSync(input, "utf8");
} catch {
  script = input;
}

// Suppress logs from the module during import
const _log = console.log;
console.log = () => {};
const { initLuaFormatter, GridScript } = await import("./dist/index.js");
console.log = _log;

await initLuaFormatter();
const result = GridScript.compressScript(script);
console.log(result);
