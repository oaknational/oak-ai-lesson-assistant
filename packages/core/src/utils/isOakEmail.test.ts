import {
  hasVerifiedOakEmail,
  isOakEmail,
  isVerifiedOakEmail,
} from "./isOakEmail";

const email = (emailAddress: string, status: string | null = "verified") => ({
  emailAddress,
  verification: status === null ? null : { status },
});

describe("isOakEmail", () => {
  it("matches the Oak domain", () => {
    expect(isOakEmail("someone@thenational.academy")).toBe(true);
    expect(isOakEmail("someone@example.com")).toBe(false);
  });
});

describe("isVerifiedOakEmail", () => {
  it("accepts a verified Oak email", () => {
    expect(isVerifiedOakEmail(email("someone@thenational.academy"))).toBe(true);
  });

  it.each(["unverified", "expired", "transferable", null])(
    "rejects an Oak email with verification status %s",
    (status) => {
      expect(
        isVerifiedOakEmail(email("someone@thenational.academy", status)),
      ).toBe(false);
    },
  );

  it("rejects a verified non-Oak email", () => {
    expect(isVerifiedOakEmail(email("someone@example.com"))).toBe(false);
  });
});

describe("hasVerifiedOakEmail", () => {
  it("rejects a verified personal email alongside an unverified Oak email", () => {
    expect(
      hasVerifiedOakEmail({
        emailAddresses: [
          email("teacher@example.com"),
          email("someone@thenational.academy", "unverified"),
        ],
      }),
    ).toBe(false);
  });

  it("accepts when any Oak email on the account is verified", () => {
    expect(
      hasVerifiedOakEmail({
        emailAddresses: [
          email("teacher@example.com"),
          email("someone@thenational.academy"),
        ],
      }),
    ).toBe(true);
  });
});
