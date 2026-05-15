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

  describe("minus operator handling", () => {
    it("should minify normal subtraction", () => {
      const result = minifyLua("local x = 10 - 3");
      expect(result).toBe("local x=10-3");
    });

    it("should preserve space before unary minus to avoid -- comment", () => {
      const result = minifyLua("local x = a - -5");
      expect(result).toBe("local x=a- -5");
    });

    it("should minify multiplication", () => {
      const result = minifyLua("local x = a * b");
      expect(result).toBe("local x=a*b");
    });

    it("should minify division", () => {
      const result = minifyLua("local x = a / b");
      expect(result).toBe("local x=a/b");
    });

    it("should minify modulo", () => {
      const result = minifyLua("local x = a % b");
      expect(result).toBe("local x=a%b");
    });

    it("should minify comparison operators", () => {
      expect(minifyLua("if a > b then end")).toBe("if a>b then end");
      expect(minifyLua("if a < b then end")).toBe("if a<b then end");
      expect(minifyLua("if a ~= b then end")).toBe("if a~=b then end");
    });

    it("should minify string concatenation", () => {
      const result = minifyLua('local x = "a" .. "b"');
      expect(result).toBe('local x="a".."b"');
    });

    it("should not create -- comment from subtraction", () => {
      const result = minifyLua("local x = 10 - 3 -- comment");
      expect(result).not.toMatch(/10--3/);
      expect(result).toContain("10-3");
    });

    it("should handle subtraction with inline comment", () => {
      const result = minifyLua("local x = 10 - 3\nreturn x -- done");
      expect(result).toBe("local x=10-3 return x -- done\n");
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

  describe("minus operator handling", () => {
    it("should minify normal subtraction", () => {
      const result = GridScript.compressScript("local x = 10 - 3");
      expect(result).toBe("local x=10-3");
    });

    it("should preserve space before unary minus to avoid -- comment", () => {
      const result = GridScript.compressScript("local x = a - -5");
      expect(result).toBe("local x=a- -5");
    });
  });
});
