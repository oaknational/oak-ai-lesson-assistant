import { User } from "@clerk/nextjs/server";

const DEVELOPMENT_USER_REGION = process.env.DEVELOPMENT_USER_REGION || null;
if (process.env.NODE_ENV === "development" && !DEVELOPMENT_USER_REGION) {
  throw new Error("DEVELOPMENT_USER_REGION is required for development");
}
if (process.env.NODE_ENV === "production" && DEVELOPMENT_USER_REGION) {
  throw new Error("DEVELOPMENT_USER_REGION is not allowed in production");
}
const GEO_RESTRICTIONS_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED === "true";

function isOakDemoUser(user: User) {
  return user.emailAddresses.some(
    (email) =>
      email.emailAddress.endsWith("@thenational.academy") &&
      email.emailAddress.includes("demo"),
  );
}

class DemoUsers {
  SUPPORTED_ISO_CODES = [
    "GB", // Great Britain
    "IM", // Isle of Man
    "JE", // Jersey
    "GG", // Guernsey
  ];

  isSupportedRegion(region: string) {
    return this.SUPPORTED_ISO_CODES.includes(region);
  }

  async getUserRegion(user: User, requestRegion: string | null) {
    const region = requestRegion ?? DEVELOPMENT_USER_REGION;

    if (!region) {
      throw new Error(
        "No request country provided. Ensure Cloudflare is sending cf-ipcountry header",
      );
    }

    const isDemoRegion = isOakDemoUser(user) || !this.isSupportedRegion(region);

    return { region, isDemoRegion };
  }

  isDemoUser(user: User): boolean {
    if (!GEO_RESTRICTIONS_ENABLED) {
      return false;
    }
    if (!("isDemoUser" in user.publicMetadata)) {
      throw new Error("User metadata is missing isDemoUser field");
    }
    return Boolean(user.publicMetadata.isDemoUser);
  }
}

export const demoUsers = new DemoUsers();
