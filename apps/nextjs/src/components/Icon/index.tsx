import Image from "next/image";

import { svgs } from "./svgs";
import type { IconName, IconSize } from "./types";

export { IconName, IconSize };
type IconProps = {
  icon: IconName;
  size?: IconSize;
  color?: "white" | "black";
  className?: string;
};

const fontSizes: Record<IconSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  "2xl": 96,
  "3xl": 128,
};

export const Icon = ({
  icon,
  size = "md",
  color,
  className,
}: Readonly<IconProps>) => {
  const iconName = color === "white" ? (`${icon}-white` as IconName) : icon;
  const iconSrc = svgs[iconName];
  if (!iconSrc) return null;
  const fontSize = fontSizes[size];

  return (
    <div
      style={{ fontSize, minWidth: fontSize, minHeight: fontSize }}
      className={className}
    >
      <Image
        src={iconSrc}
        width={fontSize}
        height={fontSize}
        alt={icon}
        priority={true}
      />
    </div>
  );
};
