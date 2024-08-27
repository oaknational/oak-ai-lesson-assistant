import { SignUp } from "@clerk/nextjs";

import SignUpSignInLayout from "@/components/SignUpSignInLayout";

const SignUpPage = () => {
  return (
    <SignUpSignInLayout loaded={true}>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </SignUpSignInLayout>
  );
};

export default SignUpPage;
