const _log = console.log;
console.log = () => {};
const { initLuaFormatter, GridScript } = await import("./dist/index.js");
console.log = _log;

const script = process.argv[2];
if (!script) {
  console.error("Usage: node humanize.mjs <script>");
  process.exit(1);
}

await initLuaFormatter();
console.log(GridScript.expandScript(script));
