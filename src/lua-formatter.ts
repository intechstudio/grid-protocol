import init, { format, type Config } from "@wasm-fmt/lua_fmt";

// Track initialization state
let isInitialized = false;

/**
 * Initialize the WASM Lua formatter module.
 * MUST be called before using minifyLua() or beautifyLua()
 * @returns Promise that resolves when initialization is complete
 */
export async function initLuaFormatter(): Promise<void> {
  if (!isInitialized) {
    await init();
    isInitialized = true;
  }
}

/**
 * Check if the formatter has been initialized
 * @returns true if initialized, false otherwise
 */
function checkInitialized(): boolean {
  if (!isInitialized) {
    console.error(
      "ERROR: Lua formatter not initialized! Call 'await initLuaFormatter()' before using minifyLua() or beautifyLua()"
    );
    throw new Error(
      "Lua formatter not initialized. Call initLuaFormatter() first."
    );
  }
  return true;
}

/**
 * Minifies Lua code by removing unnecessary whitespace while preserving comments
 * @param code - The Lua code to minify
 * @returns Minified Lua code
 * @throws Error if formatter not initialized
 */
export function minifyLua(code: string): string {
  checkInitialized();
  // Step 1: Format with minify-friendly options
  const minifyOptions: Config = {
    indent_style: "space",
    indent_width: 0,
    line_width: 9999,
    line_ending: "lf",
    quote_style: "ForceDouble",
    call_parentheses: "Always",
    collapse_simple_statement: "Always",
  };

  const formatted = format(code, "main.lua", minifyOptions);

  // Step 2: Minify (keeping all comments)
  const minified = formatted
    .split("\n") // Split into lines
    .map((line) => line.trim()) // Remove indentation from each line
    .filter((line) => line.length > 0) // Remove empty lines
    .map((line, index, array) => {
      // Check if line is ONLY a LINE comment (starts with -- but not --[[)
      const isLineCommentOnly = line.match(/^--(?!\[)/);
      // Check if line has a line comment anywhere (-- but not --[[)
      const hasLineComment = line.match(/--(?!\[)/);
      // Check if next line is a comment-only line
      const nextIsLineCommentOnly = array[index + 1]?.match(/^--(?!\[)/);

      if (isLineCommentOnly) {
        return "\n" + line + "\n"; // Newline BEFORE and AFTER comment-only lines
      }
      if (hasLineComment || nextIsLineCommentOnly) {
        return line + "\n"; // Newline after line comments or before next comment-only
      }
      return line + " "; // Otherwise, join with space
    })
    .join("") // Combine all
    .replace(/[ \t]*([(){}\[\],;=])[ \t]*/g, "$1") // Remove ONLY spaces/tabs around punctuation (not newlines!)
    .replace(/ +/g, " ") // Collapse multiple spaces
    .replace(/\n+/g, "\n") // Collapse multiple newlines to max 1
    .trim(); // Remove leading/trailing whitespace

  // If the minified code ends with an inline comment (-- but not block comment),
  // append a newline to prevent issues when concatenating more code later
  if (/--(?!\[\[).*$/.test(minified) && !minified.endsWith("]]")) {
    return minified + "\n";
  }

  return minified;
}

/**
 * Beautifies Lua code with proper formatting
 * @param code - The Lua code to beautify
 * @returns Beautified Lua code
 * @throws Error if formatter not initialized
 */
export function beautifyLua(code: string): string {
  checkInitialized();
  const beautifyOptions: Config = {
    indent_style: "space",
    indent_width: 2,
    line_width: 9999,
    line_ending: "lf",
    quote_style: "ForceDouble",
    call_parentheses: "Always",
    collapse_simple_statement: "Never",
  };

  return format(code, "main.lua", beautifyOptions);
}
