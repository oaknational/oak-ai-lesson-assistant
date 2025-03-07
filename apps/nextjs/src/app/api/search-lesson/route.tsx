const OPEN_AI_AUTH_TOKEN = process.env.OPEN_AI_AUTH_TOKEN;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  const response = await fetch(
    `https://open-api.thenational.academy/api/v0/search/lessons?q=${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPEN_AI_AUTH_TOKEN}`,
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();
  return Response.json(data);
}
