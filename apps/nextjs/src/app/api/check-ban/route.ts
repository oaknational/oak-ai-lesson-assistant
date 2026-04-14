import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const rateLimiter = new Ratelimit({
  redis: kv,
  prefix: "rateLimit:checkBan",
  limiter: Ratelimit.fixedWindow(5, "60 s"),
});

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
    });

    const user = users.data[0];

    if (user?.banned) {
      return NextResponse.json({ banned: true });
    }

    return NextResponse.json({ banned: false });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Failed to check ban status" },
      { status: 500 },
    );
  }
}
