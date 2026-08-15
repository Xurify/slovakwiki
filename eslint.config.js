import tseslint from "typescript-eslint";

const clockInternals = {
  group: ["$lib/learning/time/clock-*", "**/learning/time/clock-*"],
  message: "Import clock internals via $lib/learning/time/clock",
};

const sessionInternals = {
  group: ["$lib/learning/time/session-*", "**/learning/time/session-*"],
  message: "Import session internals via $lib/learning/time/session",
};

const catalogWords = {
  group: ["$lib/catalog/dictionary/words", "**/catalog/dictionary/words"],
  message: "Import words via $lib/catalog/entries",
};

/**
 * Public-barrel lock (clock.ts, session.ts, catalog/entries).
 * eslint-plugin-boundaries v7 file selectors did not apply to relative TS imports here;
 * no-restricted-imports enforces the same edges.
 */
export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "static/**", "**/*.generated.ts"],
  },
  {
    files: ["src/lib/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { sourceType: "module" },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [clockInternals, sessionInternals, catalogWords] },
      ],
    },
  },
  {
    files: ["src/lib/learning/time/clock.ts", "src/lib/learning/time/clock-*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [sessionInternals, catalogWords] }],
    },
  },
  {
    files: ["src/lib/learning/time/session.ts", "src/lib/learning/time/session-*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [clockInternals, catalogWords] }],
    },
  },
  {
    files: ["src/lib/catalog/entries.ts", "src/lib/catalog/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [clockInternals, sessionInternals] },
      ],
    },
  },
);
