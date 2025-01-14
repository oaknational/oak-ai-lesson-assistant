// Called with pnpm run process:lessons -- --keyStage=3 --subject=religious-education
import { aiLogger } from "@oakai/logger";
import invariant from "tiny-invariant";

import { inngest } from "../inngest";

const log = aiLogger("core");

const main = async () => {
  try {
    log.info(process.env);
    invariant(
      process.env.npm_config_subject,
      "Subject slug must be set. Eg. religious-education",
    );
    invariant(
      process.env.npm_config_keystage,
      "Key stage must be set. An integer in the range 1-4",
    );
    await inngest.send({
      name: "app/subject.transcripts.embed",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
    await inngest.send({
      name: "app/subject.summarise",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
    await inngest.send({
      name: "app/subject.quizzes.embed",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
  } catch (e) {
    log.error(e);
    process.exit(1);
  } finally {
    log.info("Done");
  }
};

main()
  .then(() => {
    log.info("Exiting");
  })
  .catch((e) => {
    log.error(e);
    process.exit(1);
  });
