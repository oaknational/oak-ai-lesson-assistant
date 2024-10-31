import type { PropsWithChildren } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { Box } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

const checkBoxRootStyles = cva(
  "flex h-13 w-13 items-center justify-center border border-black border-opacity-100 bg-white ",
  {
    variants: {
      size: {
        sm: "mt-6 h-9 w-9",
        base: "mt-7 h-10 w-10",
        md: "mt-2 h-13 w-13",
        lg: "mt-6 h-16 w-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const labelStyles = cva("Label cursor-pointer", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base",
      md: "text-md",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const tickStyles = cva("", {
  variants: {
    size: {
      sm: "scale-100",
      base: "scale-125",
      md: "scale-150",
      lg: "scale-150",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type CheckboxProps = {
  label: string;
  setValue: (value: boolean) => void;
  size?: "sm" | "md" | "base" | "lg";
};

const CheckBox = ({
  label,
  children,
  setValue,
  size = "md",
}: Readonly<PropsWithChildren<CheckboxProps>>) => {
  return (
    <div className="mb-8 flex gap-8">
      <Box>
        <Checkbox.Root
          className={checkBoxRootStyles({ size })}
          id={label}
          onCheckedChange={(e: boolean) => setValue(e)}
        >
          <Checkbox.Indicator>
            <Box className={tickStyles({ size })}>
              <CheckIcon />
            </Box>
          </Checkbox.Indicator>
        </Checkbox.Root>
      </Box>
      <label className={labelStyles({ size })} htmlFor={label}>
        {children ?? label}
      </label>
    </div>
  );
};

export default CheckBox;
