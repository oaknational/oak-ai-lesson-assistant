import { dirname } from "path";
import { fileURLToPath } from "url";

export function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}
