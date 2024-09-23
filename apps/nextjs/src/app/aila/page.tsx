import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ChatStart } from "@/components/AppComponents/Chat/chat-start";
import Layout from "@/components/AppComponents/Layout";

export default async function IndexPage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect(`/sign-in?next=/aila`);
  }

  return (
    <>
      <SignedIn>
        <Layout>
          <ChatStart />
        </Layout>
      </SignedIn>
      <SignedOut></SignedOut>
    </>
  );
}
