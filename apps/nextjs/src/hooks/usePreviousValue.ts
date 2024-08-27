import { useEffect, useRef } from "react";

export function usePreviousValue<T>(value: T): T | null {
  const previousValue = useRef<T | null>(null);

  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return previousValue.current;
}
