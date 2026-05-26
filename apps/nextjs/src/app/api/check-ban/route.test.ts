import { clerkClient } from "@clerk/nextjs/server";

import { checkRateLimit } from "./rate-limit";
import { POST } from "./route";

jest.mock("./rate-limit");

const mockCheckRateLimit = jest.mocked(checkRateLimit);

jest.mock("@clerk/nextjs/server");

const mockGetUserList = jest.fn();
const mockClerkClient = jest.mocked(clerkClient);

jest.mock("@sentry/node", () => ({
  captureException: jest.fn(),
}));

const mockLimit = mockCheckRateLimit;

function createRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/check-ban", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/check-ban", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit.mockResolvedValue(true);

    mockClerkClient.mockResolvedValue({
      users: {
        getUserList: mockGetUserList,
      },
    } as unknown as Awaited<ReturnType<typeof clerkClient>>);

    mockGetUserList.mockResolvedValue({ data: [] });
  });

  it("returns 429 when rate limited", async () => {
    mockLimit.mockResolvedValue(false);

    const res = await POST(
      createRequest(
        { email: "test@example.com" },
        { "x-forwarded-for": "1.2.3.4" },
      ),
    );

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "Too many requests" });
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(createRequest({}));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Email is required" });
  });

  it("returns 400 when email is not a string", async () => {
    const res = await POST(createRequest({ email: 123 }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Email is required" });
  });

  it("returns banned: true when user is banned", async () => {
    mockGetUserList.mockResolvedValue({
      data: [{ banned: true }],
    });

    const res = await POST(
      createRequest(
        { email: "banned@example.com" },

        { "x-forwarded-for": "1.2.3.4" },
      ),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ banned: true });
    expect(mockGetUserList).toHaveBeenCalledWith({
      emailAddress: ["banned@example.com"],
      limit: 1,
    });
  });

  it("returns banned: false when user is not banned", async () => {
    mockGetUserList.mockResolvedValue({
      data: [{ banned: false }],
    });

    const res = await POST(createRequest({ email: "good@example.com" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ banned: false });
  });

  it("returns banned: false when user is not found", async () => {
    mockGetUserList.mockResolvedValue({ data: [] });

    const res = await POST(createRequest({ email: "unknown@example.com" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ banned: false });
  });

  it("returns 500 when Clerk throws", async () => {
    mockGetUserList.mockRejectedValue(new Error("Clerk unavailable"));

    const res = await POST(createRequest({ email: "test@example.com" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to check ban status" });

    const Sentry = await import("@sentry/node");
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("skips rate limiting when no IP header is present", async () => {
    mockGetUserList.mockResolvedValue({ data: [{ banned: false }] });

    const res = await POST(createRequest({ email: "test@example.com" }));

    expect(mockLimit).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("extracts IP from x-forwarded-for with multiple values", async () => {
    mockGetUserList.mockResolvedValue({ data: [{ banned: false }] });

    await POST(
      createRequest(
        { email: "test@example.com" },
        { "x-forwarded-for": "10.0.0.1, 10.0.0.2" },
      ),
    );

    expect(mockLimit).toHaveBeenCalledWith("10.0.0.1");
  });

  it("falls back to x-real-ip header", async () => {
    mockGetUserList.mockResolvedValue({ data: [{ banned: false }] });

    await POST(
      createRequest(
        { email: "test@example.com" },
        { "x-real-ip": "192.168.1.1" },
      ),
    );

    expect(mockLimit).toHaveBeenCalledWith("192.168.1.1");
  });
});
