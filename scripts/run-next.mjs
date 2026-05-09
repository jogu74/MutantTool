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

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
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
