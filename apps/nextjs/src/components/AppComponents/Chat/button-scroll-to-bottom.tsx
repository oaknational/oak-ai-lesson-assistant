"use client";

import {
  Button,
  type ButtonProps,
} from "@/components/AppComponents/Chat/ui/button";
import { IconArrowDown } from "@/components/AppComponents/Chat/ui/icons";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { useAtBottom } from "@/lib/hooks/use-at-bottom";
import { cn } from "@/lib/utils";

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();
  const { trackEvent } = useAnalytics();
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-10 top-5 z-10 bg-background transition-opacity duration-300 sm:right-18 md:top-7",
        isAtBottom ? "opacity-0" : "opacity-100",
        className,
      )}
      onClick={() => {
        trackEvent("chat:scroll_to_bottom");
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: "smooth",
        });
      }}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
