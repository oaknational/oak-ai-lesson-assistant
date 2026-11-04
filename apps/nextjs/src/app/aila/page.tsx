import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AilaStart } from "@/components/AppComponents/Chat/aila-start";
import Layout from "@/components/AppComponents/Layout";

export default async function IndexPage() {
  const clerkAuthentication = await auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  return (
    <Show when="signed-in">
      <Layout>
        <AilaStart />
      </Layout>
    </Show>
  );
}
