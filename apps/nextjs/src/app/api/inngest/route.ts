import { functions, inngest } from "@oakai/core";

import { serve } from "inngest/next";

const inngestServer = serve({ client: inngest, functions });
export const maxDuration = 60;
// export const config = {
//   type: "experimental-background",
// };

export const { GET, POST, PUT } = inngestServer;
