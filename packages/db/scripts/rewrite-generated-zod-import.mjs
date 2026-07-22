// zod-prisma@0.5.4 hardcodes `import * as z from "zod"` in every generated
// schema. Since this package now depends on zod 4 (to share one physical copy
// with the rest of the monorepo), bare "zod" resolves to the v4 API, which
// breaks the v3-style code zod-prisma emits (e.g. single-arg `z.record`).
// Rewriting the import to the "zod/v3" compat subpath keeps the generated
// schemas on the v3 API while staying the same physical zod@4 copy that app
// code consumes via `zod/v3` — so db schemas and their consumers type-check.
//
// This runs as the last step of every `db-generate*` script, so a fresh
// `prisma generate` can never reintroduce the broken import.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemasDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "prisma",
  "zod-schemas",
);

const FROM = 'import * as z from "zod"';
const TO = 'import * as z from "zod/v3"';

let changed = 0;
for (const file of readdirSync(schemasDir)) {
  if (!file.endsWith(".ts")) continue;
  const path = join(schemasDir, file);
  const contents = readFileSync(path, "utf8");
  if (!contents.includes(FROM)) continue;
  writeFileSync(path, contents.replace(FROM, TO));
  changed += 1;
}

console.log(
  `Rewrote zod import to "zod/v3" in ${changed} generated schema(s).`,
);
