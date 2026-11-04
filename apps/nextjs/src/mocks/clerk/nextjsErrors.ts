/*
Mocks @clerk/nextjs/errors for use in Storybook.
See ./nextjs.ts for why Clerk is mocked.
*/

export class ClerkOfflineError extends Error {
  static is(error: unknown): error is ClerkOfflineError {
    return error instanceof ClerkOfflineError;
  }
}
