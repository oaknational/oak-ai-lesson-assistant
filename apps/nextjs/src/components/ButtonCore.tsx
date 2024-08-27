import { Box } from "@radix-ui/themes";
import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import splodge from "@/assets/svg/splodge.svg";

import { Icon, IconName } from "./Icon";

type ContainerClassNameFn = (options: {
  disabled?: boolean;
  width?: "fill" | "fit";
  variant?: ButtonVariant;
}) => string;

type ButtonClassNameType = (options: {
  variant: ButtonVariant;
  active?: boolean;
  width?: "fill" | "fit";
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  disabled?: boolean;
}) => string;

type ButtonCoreProps = {
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
  containerClassName: ContainerClassNameFn;
  button: ButtonClassNameType;
  download?: boolean;
  title?: string;
  testId?: string;
};

export type ButtonVariant = "primary" | "secondary" | "text-link" | "icon-only";

const textColourForVariant = (variant: ButtonVariant) => {
  return variant === "primary" ? "white" : "black";
};

type IconWrapperProps = {
  icon: IconName;
  variant: ButtonVariant;
  iconPosition?: "leading" | "trailing";
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  hasBackground?: boolean;
};

const iconClassName = cva("relative  ", {
  variants: {
    variant: {
      "icon-only": "ml-0",
      primary: "",
      secondary: "",
      "text-link": "",
    },
    size: {
      sm: "scale-100",
      md: "scale-75 sm:scale-100 ",
      lg: "scale-125",
      xl: "scale-150",
      xxl: "scale-150",
    },
    iconPosition: {
      leading: "",
      trailing: "",
    },
    hasBackground: {
      true: "p-5",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const IconWrapper = ({
  icon,
  variant,
  iconPosition,
  size,
  hasBackground,
}: Readonly<IconWrapperProps>) => {
  const color = textColourForVariant(variant);
  if (hasBackground === null) {
    hasBackground = true;
  }
  return (
    <span
      className={iconClassName({ variant, iconPosition, size, hasBackground })}
    >
      {hasBackground && (
        <Image src={splodge} alt="splodge" className="absolute inset-0 z-0" />
      )}
      <span className="relative ">
        <Icon icon={icon} size="xs" color={color} />
      </span>
    </span>
  );
};

const ButtonCore = ({
  children,
  onClick,
  href,
  variant,
  active,
  icon,
  width,
  size,
  disabled,
  target,
  iconPosition,
  onMouseEnter,
  onMouseLeave,
  type,
  containerClassName,
  button,
  download,
  title,
  testId,
}: ButtonCoreProps) => {
  if (!iconPosition) {
    iconPosition = "trailing";
  }

  if (href && !disabled) {
    return (
      <Box
        className={containerClassName({
          disabled,
          width,
          variant,
        })}
      >
        <Link
          href={href}
          className={button({ variant, active, width, size })}
          onClick={onClick}
          aria-label={children ? (children as string) : icon + "icon button"}
          target={target}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          download={download}
          prefetch={false}
          title={title}
          data-testid={testId}
        >
          {icon && iconPosition === "leading" && (
            <IconWrapper
              icon={icon}
              variant={variant}
              iconPosition={iconPosition}
              size={size}
            />
          )}
          {variant !== "icon-only" && children}
          {icon && iconPosition === "trailing" && (
            <IconWrapper icon={icon} variant={variant} size={size} />
          )}
        </Link>
      </Box>
    );
  }
  return (
    <Box
      position="relative"
      className={containerClassName({ disabled, width })}
    >
      <button
        onClick={onClick}
        className={button({ variant, active, width, size, disabled })}
        aria-label={children ? (children as string) : icon + "icon button"}
        disabled={disabled}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        type={type}
        title={title}
        data-testid={testId}
      >
        {icon && iconPosition === "leading" && (
          <IconWrapper
            icon={icon}
            variant={variant}
            iconPosition={iconPosition}
            size={size}
          />
        )}
        {variant !== "icon-only" && children}
        {icon && iconPosition === "trailing" && (
          <IconWrapper
            icon={icon}
            variant={variant}
            iconPosition={iconPosition}
            size={size}
          />
        )}
      </button>
    </Box>
  );
};

export default ButtonCore;
