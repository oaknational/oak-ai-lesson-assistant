import { SignIn } from "@clerk/nextjs";

import SignUpSignInLayout from "@/components/SignUpSignInLayout";

import DetectStuckBannedUser from "./DetectStuckBannedUser";

const SignInPage = () => {
  return (
    <>
      <SignUpSignInLayout loaded={true}>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </SignUpSignInLayout>

      <DetectStuckBannedUser />
    </>
  );
};

export default SignInPage;
