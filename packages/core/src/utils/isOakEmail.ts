export function isOakEmail(email: string = ""): boolean {
  return email.endsWith("@thenational.academy");
}

/**
 * Structural subset of Clerk's EmailAddress, satisfied by both the backend
 * `User` and the frontend `UserResource` email addresses
 */
type ClerkEmailAddressLike = {
  emailAddress: string;
  verification: { status: string | null } | null;
};

/**
 * Clerk returns every email address on an account, including ones the user
 * has added but not verified. Only a verified address proves mailbox ownership
 */
export function isVerifiedOakEmail(email: ClerkEmailAddressLike): boolean {
  return (
    isOakEmail(email.emailAddress) && email.verification?.status === "verified"
  );
}

export function hasVerifiedOakEmail(user: {
  emailAddresses: ClerkEmailAddressLike[];
}): boolean {
  return user.emailAddresses.some(isVerifiedOakEmail);
}
