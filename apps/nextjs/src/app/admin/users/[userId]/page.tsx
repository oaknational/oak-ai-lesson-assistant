"use client";

import { aiLogger } from "@oakai/logger";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

import { AdminUserView } from "./view";

interface AdminUserProps {
  params: {
    userId: string;
  };
}

const log = aiLogger("admin");

export default function AdminUser({ params }: Readonly<AdminUserProps>) {
  const { userId } = params;
  const {
    data: safetyViolations,
    isLoading: isSafetyViolationsLoading,
    refetch,
  } = trpc.admin.getSafetyViolationsForUser.useQuery({
    userId,
  });

  if (isSafetyViolationsLoading) {
    return <LoadingWheel />;
  }

  log.info("chat", safetyViolations);

  if (!safetyViolations) {
    return <div>No safety violations found</div>;
  }

  return (
    <AdminUserView
      userId={userId}
      safetyViolations={safetyViolations}
      refetchSafetyViolations={() => void refetch()}
    />
  );
}
