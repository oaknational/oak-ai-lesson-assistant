// import fs from "node:fs";
// import { dirname } from "node:path";
// import { fileURLToPath } from "node:url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export const routerInstructions = fs.readFileSync(
//   __dirname + "/router_instructions.txt",
//   "utf-8",
// );

// export const messageToUserInstructions = fs.readFileSync(
//   __dirname + "/message_to_user_instructions.txt",
//   "utf-8",
// );

export { messageToUserInstructions } from "./messageToUserInstructions";
export { routerInstructions } from "./routerInstructions";
