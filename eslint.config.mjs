import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  ...obsidianmd.configs.recommended,
  globalIgnores([
    "main.js",
    "*.map",
    "node_modules/",
    ".github/",
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.*", "esbuild.config.*", "version-bump.*"],
        },
      },
    },
  },
  {
    files: ["esbuild.config.mjs", "version-bump.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "obsidianmd/no-nodejs-modules": "off",
    },
  },
]);
