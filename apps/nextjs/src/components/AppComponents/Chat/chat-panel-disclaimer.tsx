"use client";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";

const ChatPanelDisclaimer = ({
  size,
}: {
  readonly size: "sm" | "md" | "lg";
}) => {
  const { t } = useTranslation();

  return <p className={`my-12 text-${size}`}>{t("common.disclaimer")}</p>;
};

export default ChatPanelDisclaimer;
