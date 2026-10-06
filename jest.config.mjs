import nextJest from "next/jest.js";

// next/jest wires in the SWC transform, next.config, .env files, the `@/`
// alias from tsconfig and stubs for CSS / image imports.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "app/robots.ts",
    "app/sitemap.ts",
    "app/api/contact/route.ts",
    "components/media/AutoplayLoopVideo.tsx",
    "components/animations/TextScramble.tsx",
    "components/homes/ved/newhero/Wordmark.tsx",
    "!lib/template/**",
  ],
};

export default createJestConfig(config);
