import { aiLogger } from "@oakai/logger";
import fs from "node:fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { getSystemPrompt } from "./generate-lesson-plans/getSystemPrompt";
import { getUserPrompt } from "./generate-lesson-plans/getUserPrompt";

const argv = await yargs(hideBin(process.argv))
  .option("title", {
    alias: "t",
    type: "string",
    description: "Lesson title",
    demandOption: true,
  })
  .option("subjectSlug", {
    alias: "s",
    type: "string",
    description: "Subject slug",
    demandOption: true,
  })
  .option("keyStageSlug", {
    alias: "k",
    type: "string",
    description: "Key stage slug",
    demandOption: true,
  })
  .help().argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = aiLogger("ingest");

printPrompt({
  title: argv.title,
  subjectSlug: argv.subjectSlug,
  keyStageSlug: argv.keyStageSlug,
});

function printPrompt({
  title,
  subjectSlug,
  keyStageSlug,
}: {
  title: string;
  subjectSlug: string;
  keyStageSlug: string;
}) {
  const rawLesson = {
    lessonTitle: title,
    keyStageSlug,
    subjectSlug,
    oakLessonId: 0, // hack to satisfy the schema
    lessonSlug: "", // hack to satisfy the schema
  };
  const systemPrompt = getSystemPrompt({
    rawLesson,
  });
  const userPrompt = getUserPrompt({
    rawLesson,
    sourcePartsToInclude: "title-subject-key-stage",
  });
  const DIR = path.join(__dirname, `_data/printPrompt`);
  fs.mkdirSync(DIR, { recursive: true });

  fs.writeFileSync(path.join(DIR, "systemPrompt.txt"), systemPrompt);
  fs.writeFileSync(path.join(DIR, "userPrompt.txt"), userPrompt);

  log.info("Prompt files written to", DIR);
}
