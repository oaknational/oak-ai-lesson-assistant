import { z } from "zod";

import { moderateResponse } from "../../../../../../packages/additional-materials/src/moderateResponse";

export async function POST(req: Request) {
  try {
    const request = await req.json();

    const body = z.object({ input: z.string() }).parse(request);

    if (!body.input) {
      return new Response(JSON.stringify({ error: "input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await moderateResponse(body.input);

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
