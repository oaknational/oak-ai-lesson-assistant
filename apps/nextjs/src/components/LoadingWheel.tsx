import React from "react";

import { Icon, IconName, IconSize } from "./Icon";

const LoadingWheel = React.forwardRef<
  HTMLDivElement,
  {
    icon?: IconName;
    size?: IconSize;
    visible?: boolean;
  }
>(({ icon = "reload", size = "md", visible = true }, ref) => {
  return (
    <div
      ref={ref}
      className={`${visible ? "block" : "hidden"} flex w-fit min-w-18`}
    >
      <Icon
        icon={icon}
        size={size}
        color="black"
        className={visible ? "animate-spin" : ""}
      />
    </div>
  );
});

LoadingWheel.displayName = "LoadingWheel";

export default LoadingWheel;
