import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly"
      }
    },
    ignores: ["**/__tests__/**", "**/databaseSetup.js"]
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-prototype-builtins": "off",
      "no-redeclare": "off"
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly"
      }
    },
  }
];