// TODO: GCLOMAX
// This is a bodge to not get rate limited. It's a bit of a hack but it works.
// Realistically we could make a queueing system for this but unsure how that works
// With vercel serverless functions ect - or wait until openai adds batching support to its
// Beta chat.

// Decorates (without experimental decorators) to add a random delay to a function.
// Adds a random delay to a function
export function withRandomDelay<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  minDelay: number,
  maxDelay: number,
): (...args: TArgs) => Promise<TResult> {
  return async function (...args: TArgs): Promise<TResult> {
    const delay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay,
    );
    console.log(`Delaying execution for ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fn(...args);
  };
}

// Example usage:
// const delayedFetchData = withRandomDelay(fetchData, 1000, 5000);

export async function processArray<T, TResult>(
  array: T[],
  asyncFunction: (item: T) => Promise<TResult>,
): Promise<TResult[]> {
  const promises = array.map((item) => asyncFunction(item));
  return Promise.all(promises);
}
