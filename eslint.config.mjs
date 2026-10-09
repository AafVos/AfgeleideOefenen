import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Werkmap van de Paperclip-agents: staat niet in de repo (alleen in
    // .git/info/exclude, dat ESLint niet leest) en is honderden MB's groot.
    ".paperclip/**",
    // Losse Remotion-werkplaats met een eigen package.json en tsconfig.json;
    // de typecontrole van de site slaat hem ook al over (zie tsconfig.json).
    "video/**",
  ]),
]);

export default eslintConfig;
