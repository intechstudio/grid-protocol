import { describe, it, expect, beforeAll } from "vitest";
import { initLuaFormatter, minifyLua } from "../lua-formatter";
import { GridScript } from "../string-operations";

describe("minifyLua", () => {
  beforeAll(async () => {
    await initLuaFormatter();
  });

  describe("trailing inline comment handling", () => {
    it("should append newline when minified code ends with an inline comment", () => {
      const code = `
        local x = 1
        local y = 2 -- this is a trailing comment
      `;
      const result = minifyLua(code);
      expect(result.endsWith("\n")).toBe(true);
    });

    it("should append newline when code ends with a comment-only line", () => {
      const code = `
        local x = 1
        -- final comment
      `;
      const result = minifyLua(code);
      expect(result.endsWith("\n")).toBe(true);
    });

    it("should NOT append extra newline when code does not end with a comment", () => {
      const code = `
        local x = 1
        local y = 2
      `;
      const result = minifyLua(code);
      expect(result.endsWith("\n")).toBe(false);
    });

    it("should NOT treat block comments as inline comments", () => {
      const code = `
        local x = 1 --[[ block comment ]]
      `;
      const result = minifyLua(code);
      // Block comments don't need trailing newline since they have explicit end
      expect(result.endsWith("\n")).toBe(false);
    });
  });
});

describe("GridScript.compressScript", () => {
  beforeAll(async () => {
    await initLuaFormatter();
  });

  describe("trailing inline comment handling", () => {
    it("should append newline when compressed code ends with an inline comment", () => {
      const code = `
        local x = 1
        local y = 2 -- this is a trailing comment
      `;
      const result = GridScript.compressScript(code);
      expect(result.endsWith("\n")).toBe(true);
    });

    it("should append newline when code ends with a comment-only line", () => {
      const code = `
        local x = 1
        -- final comment
      `;
      const result = GridScript.compressScript(code);
      expect(result.endsWith("\n")).toBe(true);
    });

    it("should NOT append extra newline when code does not end with a comment", () => {
      const code = `
        local x = 1
        local y = 2
      `;
      const result = GridScript.compressScript(code);
      expect(result.endsWith("\n")).toBe(false);
    });

    it("should NOT treat block comments as inline comments", () => {
      const code = `
        local x = 1 --[[ block comment ]]
      `;
      const result = GridScript.compressScript(code);
      // Block comments don't need trailing newline since they have explicit end
      expect(result.endsWith("\n")).toBe(false);
    });
  });
});
