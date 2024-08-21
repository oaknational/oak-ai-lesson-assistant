/**
 * API types
 */
export type OutputData = {
  fileUrl: string;
  fileId: string;
  templateId: string;
  userCanViewGdriveFile: boolean;
};
export type Result<Data> = { data: Data } | { error: unknown; message: string };
export type State<Data> =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "error"; error: unknown }
  | { status: "success"; data: Data };

/**
 * Util types
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
