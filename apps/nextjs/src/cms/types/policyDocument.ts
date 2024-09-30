export interface PolicyDocument {
  title: string;
  slug: string;
  fake_updatedAt: string;
  // Borrowed from OWA where they have recommended leaving body as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}
