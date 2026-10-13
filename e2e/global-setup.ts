import { execSync } from "node:child_process";

// Before the tests: reset the demo users and their data, so every run
// starts from the same state. Only demo users are touched (seed.ts).
export default function globalSetup() {
  execSync("npm run db:seed", { stdio: "inherit" });
}
