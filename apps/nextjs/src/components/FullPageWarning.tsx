import React from "react";

import Button from "./Button";
import type { IconName, IconSize } from "./Icon";
import { Icon } from "./Icon";

export type FullPageWarningProps = Readonly<{
  children: React.ReactNode;
}>;

const FullPageWarning = ({ children }: FullPageWarningProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-lavender30">
      <div className="flex max-w-xl flex-col items-center justify-center px-8 pb-28 text-center">
        {children}
      </div>
    </div>
  );
};

export type FullPageWarningIconProps = Readonly<{
  icon: IconName;
  size: IconSize;
}>;

const FullPageWarningIcon = ({ icon, size }: FullPageWarningIconProps) => {
  return <Icon icon={icon} size={size} className="mb-8" />;
};

export type FullPageWarningHeaderProps = Readonly<{
  children: React.ReactNode;
}>;

const FullPageWarningHeader = ({ children }: FullPageWarningHeaderProps) => {
  return <h1 className="mb-14 text-2xl font-bold">{children}</h1>;
};

export type FullPageWarningContentProps = Readonly<{
  children: React.ReactNode;
}>;

const FullPageWarningContent = ({ children }: FullPageWarningContentProps) => {
  return <p className="mb-18 text-lg">{children}</p>;
};

export type FullPageWarningButtonProps = Readonly<{
  children: React.ReactNode;
  href: string;
}>;

const FullPageWarningButton = ({
  children,
  href,
}: FullPageWarningButtonProps) => {
  return (
    <Button href={href} variant="primary">
      {children}
    </Button>
  );
};

FullPageWarning.Icon = FullPageWarningIcon;
FullPageWarning.Header = FullPageWarningHeader;
FullPageWarning.Content = FullPageWarningContent;
FullPageWarning.Button = FullPageWarningButton;

export default FullPageWarning;
