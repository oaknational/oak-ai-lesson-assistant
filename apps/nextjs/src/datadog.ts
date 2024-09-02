import { client, v2 } from "@datadog/datadog-api-client";

const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: process.env.DD_API_KEY,
    appKeyAuth: process.env.DD_APP_KEY,
  },
});

export const datadogApi = new v2.MetricsApi(configuration);

export const serverRuntimeConfig = {
  DATADOG_API_KEY: process.env.DD_API_KEY,
  DATADOG_APPLICATION_KEY: process.env.DD_APP_KEY,
  DATADOG_SITE: process.env.DD_SITE ?? "datadoghq.eu",
};
