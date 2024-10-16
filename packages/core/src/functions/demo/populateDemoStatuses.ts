import { clerkClient } from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";

import { inngest } from "../../client";
import { populateDemoStatusesSchema } from "./populateDemoStatuses.schema";

const log = aiLogger("demo");
log.enabled = true;

export const populateDemoStatuses = inngest.createFunction(
  {
    name: "Populate demo statuses",
    id: "app-demo-populate-statuses",
  },
  { event: "app/demo.populateStatuses" },
  async ({ event, step }) => {
    const args = populateDemoStatusesSchema.data.parse(event.data);
    const DRY_RUN = args.dryRun;

    if (DRY_RUN) {
      log("Running in dry run mode");
    }

    async function updateUser(id: string) {
      log("Updating user", id);

      if (!DRY_RUN) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            isDemoUser: false,
          },
        });
      }
    }

    let offset = 0;

    while (true) {
      const result = await step.run("Process page", async () => {
        const { data } = await clerkClient.users.getUserList({
          limit: 100,
          offset,
          orderBy: "created_at",
        });
        log(`${data.length} records fetched at ${offset} offset`);

        if (data.length === 0) {
          return { continue: false as const };
        }

        log(data.map((user) => user.publicMetadata.isDemoUser));

        await Promise.all(
          data
            .filter((user) => !("isDemoUser" in user.publicMetadata))
            .map(async (user) => {
              return await updateUser(user.id);
            }),
        );

        return {
          offset: offset + data.length,
          continue: true as const,
        };
      });

      if (result.continue) {
        offset = result.offset;
      } else {
        break;
      }
    }

    log("Done");
  },
);
