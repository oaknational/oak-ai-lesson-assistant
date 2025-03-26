import { useEffect } from "react";

import { Flex, Heading } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import useAnalytics from "@/lib/analytics/useAnalytics";

import Button from "./Button";

const exportMenuStyles = cva(
  "fixed bottom-0 left-0 top-0 z-[60] w-full overflow-y-scroll bg-aqua p-17 pb-30 delay-100 duration-200 md:w-[50%]",
  {
    variants: {
      open: {
        true: "translate-x-0",
        false: "-translate-x-full",
      },
    },
  },
);

const exportMenuOverlayStyles = cva(
  "fixed inset-0 bg-black bg-opacity-60 delay-100 duration-200 hover:bg-opacity-30",
  {
    variants: {
      open: {
        true: "z-50 flex",
        false: "-z-50 hidden",
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

interface ExportMenuProps {
  isOpen: boolean;
  toggleIsOpen: () => void;
  keyStage: string;
  subject: string;
  children: React.ReactNode;
  appSlug: string;
}

const ExportMenuWrap = ({
  isOpen,
  toggleIsOpen,
  keyStage,
  subject,
  children,
}: Readonly<ExportMenuProps>) => {
  return (
    <>
      <button
        className={exportMenuOverlayStyles({ open: isOpen })}
        onClick={toggleIsOpen}
        disabled={!keyStage || !subject}
      />
      <nav className={exportMenuStyles({ open: isOpen })}>
        <Flex mb="4" direction="row" justify="between" align="center">
          <Heading size="4">Export Menu</Heading>
          <Button
            icon="cross"
            size="lg"
            variant="icon-only"
            onClick={toggleIsOpen}
          />
        </Flex>
        {children}
      </nav>
    </>
  );
};

export default ExportMenuWrap;
