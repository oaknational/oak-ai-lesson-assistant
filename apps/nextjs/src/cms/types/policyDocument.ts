export interface PolicyDocument {
  title: string;
  slug: string;
  // Borrowed from OWA where they have recommended leaving body as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}
