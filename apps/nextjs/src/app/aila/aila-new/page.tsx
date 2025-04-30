import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AilaStart } from "@/components/AppComponents/Chat/aila-start";
import Layout from "@/components/AppComponents/Layout";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

interface IndexPageProps {
  searchParams: {
    keyStage?: string;
    subject?: string;
    unitTitle?: string;
    searchExpression?: string;
  };
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  // Destructure searchParams with default values of null if not present
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
          <AilaStart
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
