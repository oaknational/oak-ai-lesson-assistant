import { GraphQLClient } from "graphql-request";

if (!process.env.OAK_GRAPHQL_SECRET) {
  throw new Error("OAK_GRAPHQL_SECRET is not set");
}

export const graphqlClient = new GraphQLClient(
  `https://hasura.thenational.academy/v1/graphql`,
  {
    headers: {
      "x-oak-auth-key": process.env.OAK_GRAPHQL_SECRET,
      "x-oak-auth-type": "oak-admin",
    },
  },
);
