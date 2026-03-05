const _log = console.log;
console.log = () => {};
const { grid, ElementType, GridScript, initLuaFormatter } =
  await import("./dist/index.js");
console.log = _log;

await initLuaFormatter();

const result = {};

for (const type of Object.values(ElementType)) {
  result[type] = grid.get_element_events(type).map((e) => {
    const config = e.defaultConfig.replace(/^<\?lua /, "").replace(/ \?>$/, "");
    return {
      name: e.desc,
      defaultConfig: config,
      defaultConfigHuman: GridScript.expandScript(config),
    };
  });
}

console.log(JSON.stringify(result, null, 2));
