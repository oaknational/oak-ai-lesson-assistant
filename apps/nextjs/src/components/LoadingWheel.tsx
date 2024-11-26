import React from "react";

import type { IconName, IconSize } from "./Icon";
import { Icon } from "./Icon";

export type LoadingWheelProps = Readonly<{
  icon?: IconName;
  size?: IconSize;
  visible?: boolean;
}>;

const LoadingWheel = React.forwardRef<HTMLDivElement, LoadingWheelProps>(
  ({ icon = "reload", size = "md", visible = true }, ref) => {
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
  },
);

LoadingWheel.displayName = "LoadingWheel";

export default LoadingWheel;
