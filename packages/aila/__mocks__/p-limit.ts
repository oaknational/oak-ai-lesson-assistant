export default function pLimit(_concurrency: number) {
  return Object.assign(
    async function limit<Arguments extends unknown[], ReturnType>(
      fn: (...args: Arguments) => PromiseLike<ReturnType> | ReturnType,
      ...args: Arguments
    ): Promise<ReturnType> {
      return Promise.resolve(fn(...args));
    },
    {
      activeCount: 0,
      pendingCount: 0,
      concurrency: _concurrency,
      clearQueue: () => {},
      map: async <Input, ReturnType>(
        iterable: Iterable<Input>,
        mapperFunction: (
          input: Input,
          index: number,
        ) => PromiseLike<ReturnType> | ReturnType,
      ): Promise<ReturnType[]> => {
        const items = Array.from(iterable);
        return Promise.all(
          items.map((item, index) => mapperFunction(item, index)),
        );
      },
    },
  );
}
