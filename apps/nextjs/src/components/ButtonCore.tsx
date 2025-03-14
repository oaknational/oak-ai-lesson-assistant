import { Box } from "@radix-ui/themes";
import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import splodge from "@/assets/svg/splodge.svg";

import type { IconName } from "./Icon";
import { Icon } from "./Icon";

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

export type ButtonCoreProps = Readonly<{
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
}>;

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

const iconClassName = cva("relative", {
  variants: {
    variant: {
      "icon-only": "ml-0",
      primary: "",
      secondary: "",
      "text-link": "",
    },
    size: {
      sm: "scale-100",
      md: "scale-75 sm:scale-100",
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
      <span className="relative">
        <Icon icon={icon} size="xs" color={color} />
      </span>
    </span>
  );
};

type ButtonLinkProps = Omit<ButtonCoreProps, "href"> & {
  href: NonNullable<ButtonCoreProps["href"]>;
};

const ButtonLink = ({
  href,
  children,
  onClick,
  variant,
  active,
  icon,
  width,
  size,
  target,
  iconPosition = "trailing",
  onMouseEnter,
  onMouseLeave,
  containerClassName,
  button,
  download,
  title,
  testId,
}: ButtonLinkProps) => (
  <Box className={containerClassName({ disabled: false, width, variant })}>
    <Link
      href={href}
      className={button({ variant, active, width, size })}
      onClick={onClick}
      aria-label={variant === "icon-only" ? `${icon} icon button` : undefined}
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

const ButtonElement = ({
  children,
  onClick,
  variant,
  active,
  icon,
  width,
  size,
  disabled,
  iconPosition = "trailing",
  onMouseEnter,
  onMouseLeave,
  type,
  containerClassName,
  button,
  title,
  testId,
}: ButtonCoreProps) => (
  <Box position="relative" className={containerClassName({ disabled, width })}>
    <button
      onClick={onClick}
      className={button({ variant, active, width, size, disabled })}
      aria-label={variant === "icon-only" ? `${icon} icon button` : undefined}
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

const ButtonCore = (props: ButtonCoreProps) => {
  return props.href && !props.disabled ? (
    <ButtonLink {...(props as ButtonLinkProps)} />
  ) : (
    <ButtonElement {...props} />
  );
};

export default ButtonCore;
