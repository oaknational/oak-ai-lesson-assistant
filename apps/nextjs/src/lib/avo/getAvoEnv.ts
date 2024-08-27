import { AvoEnv } from "./Avo";

/**
 * Avo will send a request to avo.app on init in non-production environments
 * @todo: use release stage from constants
 */
const getAvoEnv = () => {
  switch (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    case "prd":
      return AvoEnv.Prod;
    case "stg":
    case "dev":
    default:
      return AvoEnv.Dev;
  }
};

export default getAvoEnv;
