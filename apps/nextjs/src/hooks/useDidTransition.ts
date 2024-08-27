import { usePreviousValue } from "./usePreviousValue";

/**
 * A hook that given a value T, returns a predicate
 * function which will return true when _entering_
 * a matching state
 *
 * Useful in useEffects where multiple values could
 * cause trigger an execution of useEffect
 *
 * n.b. when using with discriminated unions this
 * unfortunately won't narrow the type
 * e.g. given { type: SUCCESS, data: T} | { type: Error }
 * it won't infer that `data` exists in a block guarded by
 * didTransitionTo(SUCCESS)
 *
 * @example
 *   const didTransitionTo = useDidTransitionTo(myCurrentStatus)
 *   // render #1 (myCurrentStatus = LOADING)
 *   didTransitionTo(SUCCESS) // -> false
 *   // render #2 (myCurrentStatus = SUCCESS)
 *   didTransitionTo(SUCCESS) // -> true
 *   // render #3 (myCurrentStatus = SUCCESS)
 *   didTransitionTo(SUCCESS) // -> false
 */
export function useDidTransition<T>(status: T) {
  const prevStatus = usePreviousValue(status);

  /**
   * Did the status transition into `to`, from
   * any other value at all
   */
  return function didTransitionTo(to: T): boolean {
    return to !== prevStatus && to === status;
  };
}
