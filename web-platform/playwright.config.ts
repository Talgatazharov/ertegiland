import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: ["**/journeys.spec.ts", "**/profiles.spec.ts", "**/layout.spec.ts"],
  use: {
    baseURL: "http://127.0.0.1:5174",
    browserName: "chromium",
    channel: "msedge",
    headless: true,
  },
  webServer: {
    command: "tsx server/index.ts",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
    timeout: 45000,
    env: {
      PORT: "5174",
      VITE_API_TARGET: "http://127.0.0.1:3101",
      OPENAI_API_KEY: "",
    },
  },
  workers: 1,
  reporter: "list",
});
