"use client";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";

export function BetaTagPage() {
  const { t } = useTranslation();

  return (
    <span className="flex h-[32px] items-center justify-center rounded-full bg-teachersPastelBlue px-9 py-1 text-sm font-semibold">
      {t("common.beta")}
    </span>
  );
}

export function BetaTagHeader() {
  const { t } = useTranslation();

  return (
    <span className="flex items-center justify-center rounded-full bg-teachersPastelBlue px-8 py-2 text-sm font-semibold text-black">
      {t("common.beta")}
    </span>
  );
}
