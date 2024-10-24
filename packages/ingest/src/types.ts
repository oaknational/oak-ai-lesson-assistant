export type IngestLogger = {
  info: (message: string) => void;
  error: (message: string) => void;
};
