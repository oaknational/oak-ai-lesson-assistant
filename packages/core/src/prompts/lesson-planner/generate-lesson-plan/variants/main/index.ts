import { inputSchema } from "../../input.schema";
import body from "./parts/body";
import context from "./parts/context";
import output from "./parts/output";
import task from "./parts/task";

const parts = { body, context, output, task, inputSchema };
export default parts;
