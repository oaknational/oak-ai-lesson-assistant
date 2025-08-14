"use client";

import SharedAdminLayout from "../../components/SharedAdminLayout";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: Readonly<UserLayoutProps>) {
  return <SharedAdminLayout>{children}</SharedAdminLayout>;
}
