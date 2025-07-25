export async function POST(req: Request) {
  console.log("Route reached!");
  return Response.json({ success: true });
}
