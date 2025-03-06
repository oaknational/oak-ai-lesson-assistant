import { fetchAdditionalMaterials } from "../../../../../../packages/additional-materials/src/fetchAdditionalMaterials";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.lessonPlan) {
      return new Response(JSON.stringify({ error: "lessonPlan is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await fetchAdditionalMaterials({
      lessonPlan: body.lessonPlan,
      userMessage: "",
      action: body.action,
    });

    console.log("result", result);

    return new Response(JSON.stringify({ message: "Success", data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("error", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
