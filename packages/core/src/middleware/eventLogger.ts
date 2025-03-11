import { aiLogger } from "@oakai/logger";

import { InngestMiddleware } from "inngest";

const log = aiLogger("inngest");

/**
 * Log out the names and some meta of all events sent to inngest
 * from the client
 *
 * This is specifically for events, aka inngest.send({ name: "app/event" })
 */
export function eventLogger(env: string, eventKey: string) {
  return new InngestMiddleware({
    name: "Event logger",
    init: ({ client }) => {
      return {
        onSendEvent() {
          return {
            transformInput({ payloads }): void {
              for (const payload of payloads) {
                log.info(
                  {
                    inngestClientId: client.id,
                    inngestEventKey: lazyRedact(eventKey, 5),
                    inngestEnv: env,
                  },
                  "Sending inngest event name=%s",
                  payload.name,
                );
              }
            },
          };
        },
      };
    },
  });
}

/**
 * Redact part of a string, leaving some for context
 *
 * In this case, we don't want to leak our event keys, but
 * we want to tell which were actually used to send the event
 *
 * @example
 *   lazyRedact('abcdefekflrgkger', 5)
 *   // -> 'abcde***********'
 */
function lazyRedact(s: string, numShown: number): string {
  return s.substring(0, numShown) + "*".repeat(s.length - numShown);
}
