/**
 * In many places we don't want to expose the whole domain model to the client
 *  - For some it contains additional fields we don't want end-users to see
 *  - For nextjs pages we have to manually serialize things like Date fields
 *    and use nulls instead of undefined
 * To try and centralize this and avoid leaking, these are all co-located
 * here for now
 *
 * Really these are similar to a DTOs (Data Transfer Objects), but we don't want to go
 * too far down that enterprisey route at this point, while it's still ok for our
 * models and FE to be coupled
 *
 * As these grow we will likely want to either extract them to their own files, or
 * make them part of the models
 */
import { App, Generation, GenerationStatus, Prompt } from "@oakai/db";
import { z } from "zod";

import { AppWithPrompt } from "./apps";

type SerializedApp = Pick<App, "id" | "slug" | "name">;

export type SerializedAppWithPrompt = SerializedApp & {
  prompts: SerializedPrompt[];
};

/**
 * Filter an App to only fields a user should be able to see
 */
export function serializeApp(app: AppWithPrompt): SerializedAppWithPrompt {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    prompts: app.prompts.map(serializePrompt),
  };
}

type SerializedPrompt = Pick<Prompt, "id" | "slug" | "name" | "template">;

/**
 * Filter a Prompt to only fields a user should be able to see
 */
function serializePrompt(prompt: Prompt): SerializedPrompt {
  return {
    id: prompt.id,
    slug: prompt.slug,
    name: prompt.name,
    template: prompt.template,
  };
}

export const serializedGenerationSchema = z.object({
  id: z.string(),
  response: z
    .object({})
    .passthrough()
    .or(z.array(z.object({}).passthrough()))
    .nullable(),
  status: z.nativeEnum(GenerationStatus),
  error: z.string().nullable(),
});

export type SerializedGeneration = z.infer<typeof serializedGenerationSchema>;

/**
 * Filter a Generation to only fields a user should be able to see
 */
export function serializeGeneration(
  generation: Generation,
): SerializedGeneration {
  return serializedGenerationSchema.parse(generation);
}
