import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AilaStart } from "@/components/AppComponents/Chat/aila-start";
import Layout from "@/components/AppComponents/Layout";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

export default async function IndexPage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  return (
    <>
      <SignedIn>
        <Layout>
          <AilaStart />
        </Layout>
      </SignedIn>
      <SignedOut></SignedOut>
    </>
  );
}
