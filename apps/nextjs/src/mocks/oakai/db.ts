/* 
Mocks prisma for use in Storybook.
See the readme for why this is needed.
*/
export const prisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: unknown) => data,
    update: async (data: unknown) => data,
    delete: async () => null,
  },
};
