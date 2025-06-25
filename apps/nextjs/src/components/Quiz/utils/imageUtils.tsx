export const constrainHeight = (h?: number) =>
  h ? Math.max(Math.min(200, h), 96) : undefined;

export const calcDims = (w?: number, h?: number) => {
  const constrainedHeight = constrainHeight(h);
  return w && h && constrainedHeight
    ? {
        width: Math.round((w / h) * constrainedHeight),
        height: constrainedHeight,
      }
    : { width: undefined, height: undefined };
};