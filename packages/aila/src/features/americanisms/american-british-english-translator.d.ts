declare module "american-british-english-translator" {
  const translator: {
    translate: (
      text: string,
      options: { american: boolean },
    ) => Record<
      string,
      Array<{ [phrase: string]: { issue: string; details: string } }>
    >;
  };
  export default translator;
}
