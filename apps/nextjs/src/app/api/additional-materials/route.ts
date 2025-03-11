import { z } from "zod";

import { fetchAdditionalMaterials } from "../../../../../../packages/additional-materials/src/fetchAdditionalMaterials";
import type { SchemaMapType } from "../../../../../../packages/additional-materials/src/schemas";

const requestBodySchema = z.object({
  lessonPlan: z.any(), // Adjust this according to the actual structure of lessonPlan
  action: z.string(),
  message: z.string().optional().nullish(),
  previousOutput: z.object({}).passthrough().optional().nullish(),
});

export async function POST(req: Request) {
  try {
    const request = await req.json();

    const body = requestBodySchema.parse(request);

    if (!body.lessonPlan) {
      return new Response(JSON.stringify({ error: "lessonPlan is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await fetchAdditionalMaterials({
      lessonPlan: body.lessonPlan,
      message: body.message,
      action: body.action as SchemaMapType,
      previousOutput: body.previousOutput,
    });

    return new Response(JSON.stringify({ message: "Success", data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
