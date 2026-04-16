import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ChatStart } from "@/components/AppComponents/Chat/chat-start";
import Layout from "@/components/AppComponents/Layout";

interface IndexPageProps {
  searchParams: Promise<{
    keyStage?: string;
    subject?: string;
    unitTitle?: string;
    searchExpression?: string;
  }>;
}
export default async function IndexPage({ searchParams }: IndexPageProps) {
  const clerkAuthentication = await auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }
  const {
    keyStage = undefined,
    subject = undefined,
    unitTitle = undefined,
    searchExpression = undefined,
  } = await searchParams;
  return (
    <>
      <SignedIn>
        <Layout feature={"aila"}>
          <ChatStart
            keyStage={keyStage}
            subject={subject}
            unitTitle={unitTitle}
            searchExpression={searchExpression}
          />
        </Layout>
      </SignedIn>
      <SignedOut></SignedOut>
    </>
  );
}
