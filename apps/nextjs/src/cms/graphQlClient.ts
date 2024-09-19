import { GraphQLClient } from "graphql-request";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

export const graphqlClient = new GraphQLClient(
  `https://${projectId}.api.sanity.io/v1/graphql/production/default`,
);
