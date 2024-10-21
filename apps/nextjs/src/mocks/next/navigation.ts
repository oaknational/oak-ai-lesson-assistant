/*
Mocks next/navigation for use in Storybook.
See the readme for more context on why this is needed.
*/
import { aiLogger } from "@oakai/logger";

const log = aiLogger("testing");

export const useRouter = () => ({
  push: (path: string) => {
    log.info("Mocked push to", path);
  },
  redirect: (path: string) => {
    log.info("Mocked redirect to", path);
  },
  replace: () => {},
  prefetch: () => {},
});

export const redirect = (path: string) => {
  log.info("Mocked redirect to", path);
};

export const usePathname = () => "/";
export const useSearchParams = () => {
  const params = new Map<string, string>([
    //['utm_source', 'mock_source'],
    //['utm_medium', 'mock_medium'],
    // Add other UTM parameters as needed
  ]);

  return {
    get: (key: string) => params.get(key) ?? null,
    getAll: (key: string) => (params.has(key) ? [params.get(key)!] : []),
    has: (key: string) => params.has(key),
    forEach: (callback: (value: string, key: string) => void) =>
      params.forEach(callback),
    [Symbol.iterator]: function* () {
      yield* params.entries();
    },
    entries: () => params.entries(),
    keys: () => params.keys(),
    values: () => params.values(),
  };
};
