import { grid, ModuleType } from "../grid-protocol";
import { GridScript } from "../string-operations";
import { test, expect } from "vitest";


// THIS TEST IS DISABLED BECAUSE BASIC CONFIG BLOCK DO NOT EVEN USE GRIDSCRIPT.COMPRESSSCRIPT METHOD
// test("Default configuration compression/expansion", function () {
//   const elements = grid.get_module_element_list(
//     ModuleType.BU16
//   );
//   elements.forEach((element) => {
//     const events = grid.get_element_events(element);
//     if (typeof events !== "undefined") {
//       events.forEach((event) => {
//         const defaultConfig = event.defaultConfig
//           .split("<?lua ")[1]
//           .split(" ?>")[0];
//         const expanded =
//           GridScript.expandScript(defaultConfig);
//         const compressed =
//           GridScript.compressScript(expanded);
//         expect(compressed).toMatch(defaultConfig);
//       });
//     }
//   });
// });

test("Various quotemark combination", function () {
  let luaString = `local str="hello('(d'"`;
  const compressed = GridScript.compressScript(luaString);
  expect(compressed).toMatch(luaString);
});

//Unexpected:
//midi_send(0, 0, 0, 0) -- asd midi_send(0,0,0,0)
test("Comment parsing: Between lines", function () {
  let luaString = `midi_send(0, 0, 0, 0)\n-- asd\nmidi_send(0, 0, 0, 0)`;
  const compressed = GridScript.compressScript(luaString);
  const expanded = GridScript.expandScript(compressed);
  expect(expanded).toMatch(luaString);
});

//  Unexpected:
//  midi_send(
//      ch,
//      176,
//      cc,
//      val
//      -- asd
//  )
test("Comment parsing: New line", function () {
  let luaString = `midi_send(ch, 176, cc, val)\n-- asd`;
  const compressed = GridScript.compressScript(luaString);
  const expanded = GridScript.expandScript(compressed);
  expect(expanded).toMatch(luaString);
});
