export type AilaErrorSeverity = "error" | "warning" | "info" | "debug";

export type AilaErrorBreadcrumb = {
  message: string;
  category?: string;
  level?: AilaErrorSeverity;
  data?: unknown;
};
