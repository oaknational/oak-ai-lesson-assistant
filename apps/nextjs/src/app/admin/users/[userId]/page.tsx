"use client";

import { use } from "react";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

import { AdminUserView } from "./view";

interface AdminUserProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function AdminUser({ params }: Readonly<AdminUserProps>) {
  const { userId } = use(params);
  const {
    data: userSafetyReview,
    isLoading: isUserSafetyReviewLoading,
    refetch,
  } = trpc.admin.getUserSafetyReview.useQuery({
    userId,
  });

  if (isUserSafetyReviewLoading) {
    return <LoadingWheel />;
  }

  if (!userSafetyReview) {
    return <div>No user safety data found</div>;
  }

  return (
    <AdminUserView
      userId={userId}
      safetyViolations={userSafetyReview.safetyViolations}
      maxAllowedSafetyViolations={userSafetyReview.maxAllowedSafetyViolations}
      threatDetections={userSafetyReview.threatDetections}
      refetchUserSafetyReview={() => void refetch()}
    />
  );
}
