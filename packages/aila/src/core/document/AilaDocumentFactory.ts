import type { z } from "zod";

import type { AilaCategorisationFeature } from "../../features/types";
import type { AilaDocumentService, AilaServices } from "../AilaServices";
import { AilaDocument } from "./AilaDocument";
import type {
  AilaDocumentContent,
  CategorisationPlugin,
  DocumentPlugin,
} from "./types";

/**
 * Create a new AilaDocument with the specified schema and optional plugins
 */
export function createAilaDocument({
  aila,
  content,
  plugin,
  categorisationPlugin,
  schema,
}: {
  aila: AilaServices;
  content?: AilaDocumentContent;
  plugin?: DocumentPlugin;
  categorisationPlugin?: CategorisationPlugin;
  schema: z.ZodType<AilaDocumentContent>;
}): AilaDocumentService {
  // Create plugins array if a plugin is provided
  const plugins: DocumentPlugin[] = [];
  if (plugin) {
    plugins.push(plugin);
  }

  // Create categorisation plugins array if a plugin is provided
  const categorisationPlugins: CategorisationPlugin[] = [];
  if (categorisationPlugin) {
    categorisationPlugins.push(categorisationPlugin);
  }

  return AilaDocument.create({
    aila,
    content,
    plugins,
    categorisationPlugins,
    schema,
  });
}
