import crypto from "node:crypto";

import { IngestError } from "../IngestError";

export function getDataHash(data: unknown) {
  try {
    const str = JSON.stringify(data);
    const hash = crypto.createHash("sha256").update(str).digest("hex");

    return hash;
  } catch (cause) {
    throw new IngestError("Failed to hash data", { cause });
  }
}
