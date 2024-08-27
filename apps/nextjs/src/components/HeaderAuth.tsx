import { UserButton, useAuth } from "@clerk/nextjs";
import { OakP } from "@oaknational/oak-components";
import Link from "next/link";

const HeaderAuth = () => {
  const { isSignedIn } = useAuth();

  return (
    <>
      {isSignedIn && <UserButton />}
      {!isSignedIn && (
        <Link href="/sign-in">
          <OakP $font="body-2">Sign in</OakP>
        </Link>
      )}
    </>
  );
};

export default HeaderAuth;
