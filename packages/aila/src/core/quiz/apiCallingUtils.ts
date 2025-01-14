// TODO: GCLOMAX
// This is a bodge to not get rate limited. It's a bit of a hack but it works.
// Realistically we could make a queueing system for this but unsure how that works
// With vercel serverless functions ect - or wait until openai adds batching support to its
// Beta chat.

// Decorates (without experimental decorators) to add a random delay to a function.
export function withRandomDelay(
  fn: (...args: any[]) => Promise<any>,
  minDelay: number,
  maxDelay: number,
) {
  return async function (...args: any[]): Promise<any> {
    const delay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay,
    );
    console.log(`Delaying execution for ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fn(...args);
  };
}

// const delayedFetchData = withRandomDelay(fetchData, 1000, 5000);

export async function processArray<T>(
  array: T[],
  asyncFunction: (item: T) => Promise<any>,
): Promise<any[]> {
  const promises = array.map((item) => asyncFunction(item));
  return Promise.all(promises);
}
