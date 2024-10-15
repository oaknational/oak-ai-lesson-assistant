export function getRootErrorCause(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }
  if ("cause" in error && error.cause) {
    return getRootErrorCause(error.cause);
  }
  return error;
}
