import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ChatStart } from "@/components/AppComponents/Chat/chat-start";
import Layout from "@/components/AppComponents/Layout";

interface IndexPageProps {
  searchParams: {
    keyStage?: string;
    subject?: string;
    unitTitle?: string;
    searchExpression?: string;
  };
}

export default function IndexPage({ searchParams }: IndexPageProps) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const {
    keyStage = undefined,
    subject = undefined,
    unitTitle = undefined,
    searchExpression = undefined,
  } = searchParams;

  return (
    <>
      <SignedIn>
        <Layout>
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
