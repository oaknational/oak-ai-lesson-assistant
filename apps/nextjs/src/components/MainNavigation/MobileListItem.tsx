import { useState } from "react";

import { usePathname } from "#next/navigation";
import { MenuItem } from "data/menus";

import Button from "../Button";

type MobileListItemProps = {
  item: MenuItem;
  setMenuOpen: (menuOpen: boolean) => void;
  menuOpen: boolean;
  featureFlag: boolean | { featureFlag: boolean };
  onClick?: () => void;
};
export const MobileListItem = ({
  item,
  setMenuOpen,
  menuOpen,
  featureFlag,
  onClick,
}: Readonly<MobileListItemProps>) => {
  console.log("featureFlag", handleFeatureFlagType(featureFlag), featureFlag);
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  return (
    <li
      key={item.id}
      className="py-5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Button
        variant="text-link"
        href={item.href}
        size="xxl"
        onClick={() => {
          if (onClick) {
            onClick();
          }
          setMenuOpen(!menuOpen);
        }}
        active={pathname === item.href}
        disabled={item.behindFeatureFlag && !handleFeatureFlagType(featureFlag)}
        icon={item.external ? "external" : undefined}
        target={item.external ? "_blank" : undefined}
      >
        <span className="mr-8 flex flex-col items-center gap-8 sm:flex-row">
          {item.title}
          {item.behindFeatureFlag && !handleFeatureFlagType(featureFlag) && (
            <span
              className={`ml-5 pt-4 text-base no-underline delay-100 duration-300 ${hover ? `opacity-100` : `opacity-0`}`}
            >
              Coming soon!
            </span>
          )}
        </span>
      </Button>
    </li>
  );
};

function handleFeatureFlagType(
  featureFlag: boolean | { featureFlag: boolean },
) {
  if (typeof featureFlag === "boolean" && featureFlag) {
    return true;
  }
  if (typeof featureFlag === "object" && featureFlag.featureFlag) {
    return true;
  }
  return false;
}
