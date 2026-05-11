import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function maybeUseWasmSwc() {
  const wasmDir = path.join(projectRoot, "node_modules", "@next", "swc-wasm-nodejs");

  if (fs.existsSync(path.join(wasmDir, "wasm.js"))) {
    process.env.NEXT_TEST_WASM_DIR ??= wasmDir;
  }
}

function maybeRelocatePrismaEngine() {
  const prismaDir = path.join(projectRoot, "generated", "prisma");

  if (!fs.existsSync(prismaDir)) {
    return;
  }

  const engineFile = fs
    .readdirSync(prismaDir)
    .find((file) => file.startsWith("libquery_engine-") && file.endsWith(".node"));

  if (!engineFile) {
    return;
  }

  const targetDir = path.join(os.tmpdir(), "mutant-ua-prisma");
  fs.mkdirSync(targetDir, { recursive: true });

  const source = path.join(prismaDir, engineFile);
  const target = path.join(targetDir, engineFile);

  fs.copyFileSync(source, target);
  process.env.PRISMA_QUERY_ENGINE_LIBRARY ??= target;
}

maybeUseWasmSwc();
maybeRelocatePrismaEngine();

const command = process.argv[2];
const standaloneServer = path.join(projectRoot, ".next", "standalone", "server.js");
const useStandaloneStart = command === "start" && fs.existsSync(standaloneServer);

const target = useStandaloneStart ? standaloneServer : require.resolve("next/dist/bin/next");
const args = useStandaloneStart ? [] : process.argv.slice(2);

if (useStandaloneStart) {
  process.env.HOSTNAME ??= "0.0.0.0";
} else if (command === "start") {
  process.env.HOSTNAME ??= "0.0.0.0";
  process.env.PORT ??= "3000";
  args.push("-H", process.env.HOSTNAME, "-p", process.env.PORT);
}

const child = spawn(process.execPath, [target, ...args], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
