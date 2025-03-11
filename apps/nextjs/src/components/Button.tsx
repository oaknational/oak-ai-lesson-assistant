import { cva } from "class-variance-authority";

import type { IconName } from "@/components/Icon";

import type { ButtonVariant } from "./ButtonCore";
import ButtonCore from "./ButtonCore";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant: ButtonVariant;
  active?: boolean;
  icon?: IconName;
  width?: "fill" | "fit";
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  disabled?: boolean;
  target?: string;
  iconPosition?: "leading" | "trailing";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  type?: "submit" | "button" | "reset";
  download?: boolean;
  title?: string;
  testId?: string;
}

const button = cva(
  [
    "flex items-center justify-center text-center",
    "transform font-bold delay-75 duration-150 hover:underline",
  ],
  {
    variants: {
      variant: {
        primary: "bg-black px-8 py-8 text-white",
        secondary: "bg-black px-8 py-8 text-white",
        "text-link": "border-0 bg-transparent px-0 text-black",
        "icon-only":
          "rounded-full border-0 bg-transparent px-0 text-black focus:outline-none focus:ring-2 focus:ring-offset-2",
      },
      active: {
        true: "underline opacity-80",
      },
      width: {
        fill: "w-full",
        fit: "w-fit",
      },
      size: {
        sm: "text-sm",
        md: "text-sm sm:text-base",
        lg: "py-6 text-lg",
        xl: "text-xl",
        xxl: "text-2xl",
      },
      disabled: {
        true: "cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "primary",
      active: false,
      width: "fill",
      size: "md",
    },
  },
);

const containerClassName = cva(["relative text-base delay-75 duration-150"], {
  variants: {
    variant: {
      primary: "",
      secondary: "",
      "text-link": "",
      "icon-only": "",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
      false: "hover:-translate-y-4 hover:opacity-90",
    },
    width: {
      fill: "w-full",
      fit: "w-fit",
    },
  },
  defaultVariants: {
    width: "fit",
  },
});

const Button = ({
  children,
  onClick,
  href,
  variant,
  active,
  icon,
  width,
  size,
  target,
  disabled,
  iconPosition,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  download,
  title,
  testId,
}: Readonly<ButtonProps>) => {
  return (
    <ButtonCore
      onClick={onClick}
      href={href}
      variant={variant}
      active={active}
      icon={icon}
      width={width}
      size={size}
      disabled={disabled}
      target={target}
      iconPosition={iconPosition}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type={type}
      containerClassName={containerClassName}
      button={button}
      download={download}
      title={title}
      testId={testId}
    >
      {children}
    </ButtonCore>
  );
};

export default Button;
