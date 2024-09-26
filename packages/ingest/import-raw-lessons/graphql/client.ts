import { GraphQLClient } from "graphql-request";

export const graphqlClient = new GraphQLClient(
  `https://hasura.thenational.academy/v1/graphql`,
  {
    headers: {
      "x-oak-auth-key": process.env.OAK_GRAPHQL_SECRET as string,
      "x-oak-auth-type": "oak-admin",
    },
  },
);
