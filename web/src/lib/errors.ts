/**
 * Safely extract an error message from an unknown error value.
 * Used in catch blocks to avoid `any` type usage.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred';
}
