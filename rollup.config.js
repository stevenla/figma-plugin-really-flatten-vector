import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "code.ts",
  output: {
    file: "code.js",
  },
  plugins: [nodeResolve(), typescript()],
};
