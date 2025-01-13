/* 
Mocks prisma for use in Storybook.
See the readme for why this is needed.
*/
export const prisma = {
  user: {
    findUnique: async () => Promise.resolve(null),
    findMany: async () => Promise.resolve([]),
    create: async (data: unknown) => Promise.resolve(data),
    update: async (data: unknown) => Promise.resolve(data),
    delete: async () => Promise.resolve(null),
  },
};
