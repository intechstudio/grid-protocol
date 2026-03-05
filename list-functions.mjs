const _log = console.log;
console.log = () => {};
const { grid } = await import("./dist/index.js");
console.log = _log;

// Build reverse map: human name -> fncKey (e.g. "midi_send" -> "GRID_LUA_FNC_G_MIDI_SEND")
const humanToFncKey = new Map();
for (const [fncKey, humanName] of grid.lua_function_to_human_map()) {
  humanToFncKey.set(humanName, fncKey);
}

function toEntry(label) {
  const name = label.replace(/^(self:|element\[\d+\]:)/, "");
  const fncKey = humanToFncKey.get(name);
  const usage = fncKey ? (grid.get_lua_function_helper(fncKey) ?? null) : null;
  return { label, usage };
}

const ac = grid.getProperty("LUA_AUTOCOMPLETE");

const result = {};
for (const f of ac) {
  const key = f.elementtype ?? "global";
  if (!result[key]) result[key] = [];
  result[key].push(toEntry(f.label));
}

console.log(JSON.stringify(result, null, 2));
