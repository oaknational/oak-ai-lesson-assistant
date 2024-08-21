import React from "react";

import { Icon, IconName, IconSize } from "./Icon";

const LoadingWheel = React.forwardRef<
  HTMLDivElement,
  {
    icon?: IconName;
    size?: IconSize;
  }
>(({ icon = "reload", size = "md" }, ref) => {
  return (
    <div ref={ref} className="flex w-fit min-w-18">
      <Icon icon={icon} size={size} color="black" className="animate-spin" />
    </div>
  );
});

LoadingWheel.displayName = "LoadingWheel";

export default LoadingWheel;
