/**
 * Report maintains a tree structure that mirrors the nesting of pipeline tasks.
 * Every mutation (start, end, setData) triggers an emit to stream updates to the debug UI.
 */

/**
 * A node in the report tree (used for children).
 */
export interface ReportNode {
  status: "pending" | "running" | "complete" | "error";
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  error?: string;
  data: Record<string, unknown>;
  children: Record<string, ReportNode>;
}

/**
 * The root node of a report tree, which includes the reportId.
 */
export interface RootReportNode extends ReportNode {
  reportId: string;
}

export class Report {
  private root: RootReportNode;

  constructor(
    reportId: string,
    private onUpdate?: (snapshot: RootReportNode) => void,
  ) {
    this.root = {
      reportId,
      status: "running",
      startedAt: Date.now(),
      data: {},
      children: {},
    };
  }

  /**
   * Navigate to a node by path. Throws if node doesn't exist.
   */
  private getNode(path: string[]): ReportNode {
    let current: ReportNode = this.root;
    for (const segment of path) {
      const child = current.children[segment];
      if (!child) {
        throw new Error(`Report node not found at path: ${path.join("/")}`);
      }
      current = child;
    }
    return current;
  }

  /**
   * Start a new child task at the given path.
   * Parent must already exist (enforced by Task.child() calling order).
   */
  startAtPath(path: string[]): void {
    if (path.length === 0) {
      throw new Error("Cannot start at root path");
    }

    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1]!;

    const parent =
      parentPath.length === 0 ? this.root : this.getNode(parentPath);
    parent.children[name] = {
      status: "running",
      startedAt: Date.now(),
      data: {},
      children: {},
    };
  }

  /**
   * Mark a task as complete at the given path.
   */
  endAtPath(path: string[]): void {
    const node = this.getNode(path);
    node.status = "complete";
    node.completedAt = Date.now();
    if (node.startedAt) {
      node.durationMs = node.completedAt - node.startedAt;
    }
  }

  /**
   * Mark a task as errored at the given path.
   */
  errorAtPath(path: string[], error: unknown): void {
    const node = this.getNode(path);
    node.status = "error";
    node.completedAt = Date.now();
    if (node.startedAt) {
      node.durationMs = node.completedAt - node.startedAt;
    }
    node.error = error instanceof Error ? error.message : String(error);
  }

  /**
   * Merge data into a task at the given path.
   */
  mergeAtPath(path: string[], data: Record<string, unknown>): void {
    const node = path.length === 0 ? this.root : this.getNode(path);
    Object.assign(node.data, data);
  }

  /**
   * Mark the entire pipeline as complete.
   */
  complete(): void {
    this.root.status = "complete";
    this.root.completedAt = Date.now();
    if (this.root.startedAt) {
      this.root.durationMs = this.root.completedAt - this.root.startedAt;
    }
  }

  /**
   * Emit the current state of the report tree.
   * Called after every mutation for real-time streaming.
   */
  emit(): void {
    this.onUpdate?.(structuredClone(this.root));
  }

  /**
   * Get a snapshot of the current report tree.
   */
  getSnapshot(): RootReportNode {
    return structuredClone(this.root);
  }
}
