import { usePathname } from "#next/navigation";
import { MenuItem } from "data/menus";

import Button from "../Button";

type MobileListItemProps = {
  item: MenuItem;
  setMenuOpen: (menuOpen: boolean) => void;
  menuOpen: boolean;

  onClick?: () => void;
};
export const MobileListItem = ({
  item,
  setMenuOpen,
  menuOpen,

  onClick,
}: Readonly<MobileListItemProps>) => {
  const pathname = usePathname();

  return (
    <li key={item.id} className="py-5">
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
      >
        <span className="mr-8 flex flex-col items-center gap-8 sm:flex-row">
          {item.title}
        </span>
      </Button>
    </li>
  );
};
