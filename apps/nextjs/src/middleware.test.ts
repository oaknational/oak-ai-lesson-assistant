import { NextRequest, NextFetchEvent } from "next/server";

import { handleError } from "./middleware";

// Adjust the import path as needed

describe("handleError", () => {
  let mockRequest: NextRequest;
  let mockEvent: NextFetchEvent;

  beforeEach(() => {
    mockRequest = {
      url: "https://example.com",
      method: "GET",
      headers: new Headers(),
      cookies: new Map(),
      geo: {},
      ip: "127.0.0.1",
      nextUrl: { pathname: "/", search: "" },
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue(""),
    } as unknown as NextRequest;

    mockEvent = {
      sourcePage: "/test",
    } as NextFetchEvent;
  });

  it("handles SyntaxError correctly", async () => {
    const error = new SyntaxError("Test syntax error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad Request" });
  });

  it("handles wrapped SyntaxError correctly", async () => {
    const error = new Error("Wrapper error");
    error.cause = new SyntaxError("Test syntax error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad Request" });
  });

  it("handles other errors correctly", async () => {
    const error = new Error("Test error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal Server Error" });
  });
});
