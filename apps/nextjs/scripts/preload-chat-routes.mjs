import axios from "axios";
import chokidar from "chokidar";
import pLimit from "p-limit";

const routesToPreBuild = [
  "/",
  "/api/trpc/main/health.check",
  "/api/trpc/chat/chat.health.check",
  "/aila/health",
  "/api/chat",
  "/aila",
];

const headers = {
  "x-dev-preload": "true",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const preBuildRoutes = async (
  retryCount = 0,
  maxRetries = 50,
  retryDelay = 1000,
  concurrency = 3,
) => {
  const limit = pLimit(concurrency);
  const timerId = `build-routes-${Date.now()}`;

  // Wait six seconds before starting to pre-build routes
  await delay(6000);

  const requests = routesToPreBuild.map((route) => {
    return limit(() => {
      if (typeof route === "string") {
        return axios
          .get(`http://localhost:2525${route}`, { headers })
          .then(() => console.log(`Pre-built route: ${route}`))
          .catch((error) => {
            const errorToLog =
              error instanceof Error ? error : new Error(String(error));
            console.log(
              `Error pre-building route: ${route}`,
              errorToLog.message,
            );
            return Promise.reject(errorToLog);
          });
      } else {
        return axios({
          method: route.method,
          url: `http://localhost:2525${route.url}`,
          headers,
        })
          .then(() =>
            console.log(
              `Pre-built route: ${route.url} (${route.method.toUpperCase()})`,
            ),
          )
          .catch((error) => {
            const errorToLog =
              error instanceof Error ? error : new Error(String(error));
            console.log(errorToLog);
            console.log(
              `Error pre-building route: ${route.url}`,
              errorToLog.message,
            );
            return Promise.reject(errorToLog);
          });
      }
    });
  });

  try {
    console.time(timerId);
    await Promise.all(requests);
    console.log("All routes pre-built successfully");
    console.timeEnd(timerId);
  } catch (error) {
    console.error(error);
    if (retryCount < maxRetries) {
      console.log(
        `Retrying pre-build (attempt ${retryCount + 1} of ${maxRetries})...`,
      );
      await delay(retryDelay);
      await preBuildRoutes(retryCount + 1, maxRetries, retryDelay);
    } else {
      console.log(`Failed to pre-build routes after ${maxRetries} attempts.`);
    }
  }
};

console.log("Warming up routes on server start...");
preBuildRoutes();

const watcher = chokidar.watch("./../src/**/*.{tsx,ts}", {
  ignored: /node_modules/,
  persistent: true,
});

watcher.on("change", async (path) => {
  console.log(`Local dev: file changed: ${path}`);
  await preBuildRoutes();
});

console.log("Watching for file changes...");
