// Called with pnpm run process:lessons -- --keyStage=3 --subject=religious-education
import invariant from "tiny-invariant";

import { inngest } from "../client";

const main = async () => {
  try {
    console.log(process.env);
    invariant(
      process.env.npm_config_subject,
      "Subject slug must be set. Eg. religious-education",
    );
    invariant(
      process.env.npm_config_keystage,
      "Key stage must be set. An integer in the range 1-4",
    );
    inngest.send({
      name: "app/subject.transcripts.embed",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
    inngest.send({
      name: "app/subject.summarise",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
    inngest.send({
      name: "app/subject.quizzes.embed",
      data: {
        subject: process.env.npm_config_subject,
        keyStage: `key-stage-${process.env.npm_config_keystage}`,
      },
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    console.log("Done");
  }
};

main()
  .then(async () => {
    console.log("Exiting");
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
