import { describe, it, expect, beforeAll } from "vitest";
import { initLuaFormatter, minifyLua } from "../lua-formatter";
import fs from "fs";
import path from "path";

const botPath = path.resolve(__dirname, "../grid_protocol_bot.json");
const data = JSON.parse(fs.readFileSync(botPath, "utf8"));
const actionstrings: Record<string, string> = {};
for (const [key, value] of Object.entries(data)) {
  if (key.startsWith("GRID_ACTIONSTRING_")) {
    actionstrings[key] = value as string;
  }
}

describe("bot.json actionstrings", () => {
  beforeAll(async () => {
    await initLuaFormatter();
  });

  it("should have at least one actionstring", () => {
    expect(Object.keys(actionstrings).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(actionstrings))(
    "%s should be already minified",
    (key, value) => {
      const lua = value.replace(/\\"/g, '"');
      const minified = minifyLua(lua);
      const minifiedEscaped = minified.replace(/"/g, '\\"');

      expect(minifiedEscaped).toBe(value);
    },
  );
});
