import { RefObject } from "react";

import { aiLogger } from "@oakai/logger";

const log = aiLogger("ui");

export interface ScrollToRefParams {
  ref: RefObject<HTMLElement>;
  containerRef: RefObject<HTMLElement>;
  duration?: number;
}
export const scrollToRef = ({
  ref,
  containerRef,
  duration = 500,
}: Readonly<ScrollToRefParams>) => {
  /// Check if the url has params of scrollSpeed

  if (ref.current && containerRef.current) {
    try {
      const { offsetTop } = ref.current;
      const scrollToPosition = offsetTop - 0;

      const start = containerRef.current.scrollTop;
      const distance = scrollToPosition - start;
      let startTime: number | null = null;
      const easeInOutQuad = (t: number): number => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

      const scroll = (currentTime: number) => {
        if (startTime === null) {
          startTime = currentTime;
        }

        const timeElapsed = startTime
          ? currentTime - startTime
          : currentTime - 0;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);

        if (containerRef.current) {
          containerRef.current.scrollTop = start + distance * ease;
        }

        // Debug: Log progress and scroll position
        //  log(`Time Elapsed: ${timeElapsed}`);
        //  log(`Progress: ${progress}`);
        //  log(`ScrollTop: ${containerRef.current.scrollTop}`);

        if (progress < 1) {
          requestAnimationFrame(scroll);
        } else {
          // Debug: Log completion
          log("Scrolling completed");
        }
      };

      requestAnimationFrame(scroll);
    } catch (error) {
      console.error("Error scrolling to ref", error);
    }
  } else {
    // Debug: Log ref or containerRef not found
    console.error("Ref or containerRef not found");
  }
};
