const _log = console.log;
console.log = () => {};
const { grid, ModuleType } = await import("./dist/index.js");
console.log = _log;

const result = {};

for (const type of Object.values(ModuleType)) {
  const elements = grid.get_module_element_list(type);
  result[type] = elements
    .filter((e) => e !== null && e !== undefined)
    .map((e, i) => ({ index: i, type: e }));
}

console.log(JSON.stringify(result, null, 2));
