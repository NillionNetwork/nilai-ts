import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/polyfills.ts"],
  format: ["cjs"],
  dts: {
    compilerOptions: {
      module: "ESNext",
      moduleResolution: "bundler",
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
