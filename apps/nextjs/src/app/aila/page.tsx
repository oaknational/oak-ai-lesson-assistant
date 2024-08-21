import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ChatStart } from "@/components/AppComponents/Chat/chat-start";
import { MobileSupportBlocker } from "@/components/AppComponents/Chat/mobile-support-blocker";
import Layout from "@/components/AppComponents/Layout";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

export default async function IndexPage() {
  const userCanViewFeature = await serverSideFeatureFlag(
    "lesson-planning-assistant",
  );
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect(`/sign-in?next=/aila`);
  }

  if (!userCanViewFeature) {
    redirect("/?redirect-reason=feature-flag-disabled");
  }

  return (
    <>
      <SignedIn>
        {userCanViewFeature && (
          <Layout featureFlag={userCanViewFeature}>
            <div className="hidden md:block">
              <ChatStart />
            </div>
            <MobileSupportBlocker />
          </Layout>
        )}
      </SignedIn>
      <SignedOut></SignedOut>
    </>
  );
}
