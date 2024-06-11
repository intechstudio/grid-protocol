import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es", // ES6 module format
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    json(),
    nodeResolve(),
    commonjs(),
  ],
  external: ["tslib"],
};
