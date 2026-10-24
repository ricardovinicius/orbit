import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const web = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workdir = join(tmpdir(), "orbit-auth-test");
const target = join(workdir, "supabase");
mkdirSync(target, { recursive: true });
const testPort = process.env.ORBIT_TEST_PORT ?? "3100";
if (
  !/^\d+$/.test(testPort) ||
  Number(testPort) < 1024 ||
  Number(testPort) > 65535
)
  throw new Error("Invalid test port.");
let config = readFileSync(resolve(web, "../supabase/config.toml"), "utf8")
  .replace('project_id = "orbit"', 'project_id = "orbit-auth-test"')
  .replace(/543(\d{2})/g, "553$1")
  .replace("inspector_port = 8083", "inspector_port = 8183")
  .replace(/\[auth.external.google\][\s\S]*$/, "");
config = config.replace(
  'site_url = "http://localhost:3000"',
  `site_url = "http://127.0.0.1:${testPort}"`,
);
writeFileSync(join(target, "config.toml"), config);
cpSync(resolve(web, "../supabase/migrations"), join(target, "migrations"), {
  recursive: true,
});
cpSync(resolve(web, "../supabase/tests"), join(target, "tests"), {
  recursive: true,
});
// The CLI mounts test files but not sibling migration files into its test container.
for (const file of readdirSync(join(target, "tests"))) {
  if (!file.endsWith(".sql")) continue;
  const path = join(target, "tests", file);
  const expanded = readFileSync(path, "utf8").replace(
    /^\\ir \.\.\/migrations\/([a-zA-Z0-9_]+\.sql)$/gm,
    (_directive, name) =>
      readFileSync(join(target, "migrations", name), "utf8"),
  );
  writeFileSync(path, expanded);
}
writeFileSync(join(target, "seed.sql"), "");
function cli(args) {
  return execFileSync(
    "pnpm",
    ["dlx", "supabase@2.121.0", "--workdir", workdir, ...args],
    { cwd: web, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}
console.log(
  "Preparing isolated Supabase test stack (orbit-auth-test, ports 55320–55329)…",
);
try {
  cli(["start"]);
  cli(["migration", "up", "--local"]);
  const status = JSON.parse(cli(["status", "--output", "json"]));
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    SUPABASE_TEST_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    SUPABASE_INTERNAL_URL: status.API_URL,
    APP_URL: `http://127.0.0.1:${testPort}`,
  };
  const [mode, ...args] = process.argv.slice(2);
  if (mode === "database") {
    console.log(cli(["test", "db"]));
  } else {
    const command =
      mode === "e2e"
        ? ["exec", "playwright", "test", ...args]
        : [
            "exec",
            "vitest",
            "run",
            "--config",
            "vitest.integration.config.mts",
            ...args,
          ];
    const result = spawnSync("pnpm", command, {
      cwd: web,
      env,
      stdio: "inherit",
    });
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  // CLI output can include credentials. Do not echo it into test reports.
  console.error(
    "Supabase test setup failed. Check Docker availability and ports 55320–55329.",
  );
  if (error instanceof Error) console.error(error.message.split("\n")[0]);
  process.exitCode = 1;
}
