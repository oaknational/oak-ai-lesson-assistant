import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";
import { NextResponse } from "next/server";

import { checkRateLimit } from "./rate-limit";

function getClientIp(req: Request): string | null {
  const headerValue =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("true-client-ip");
  const ip = headerValue?.split(",")[0]?.trim();
  return ip && ip.length > 0 ? ip : null;
}
export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (ip !== null) {
    const allowed = await checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  let email: unknown;
  try {
    const body = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }
    email = (body as { email?: unknown }).email;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  try {
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const client = await clerkClient();

    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
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
