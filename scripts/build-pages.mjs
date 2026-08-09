import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";


const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const env = {
  ...process.env,
  GITHUB_PAGES_BUILD: "true",
  NEXT_PUBLIC_BASE_PATH:
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/AIIGovernance-docs",
};
const result = spawnSync(process.execPath, [nextCli, "build"], {
  env,
  stdio: "inherit",
  shell: false,
});
if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
