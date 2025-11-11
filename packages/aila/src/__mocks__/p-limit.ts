// Mock p-limit to avoid ESM import issues in Jest
// In tests, we don't need actual rate limiting - we just run operations in parallel
export default function pLimit(_concurrency: number) {
  return {
    map: async <T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> => {
      return Promise.all(items.map(fn));
    },
  };
}
