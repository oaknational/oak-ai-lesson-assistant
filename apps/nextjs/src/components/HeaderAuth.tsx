import { UserButton, useAuth } from "@clerk/nextjs";
import { OakP } from "@oaknational/oak-components";

const HeaderAuth = () => {
  const { isSignedIn } = useAuth();

  return (
    <>
      {isSignedIn && <UserButton />}
      {!isSignedIn && (
        <a href="/sign-in">
          <OakP $font="body-2">Sign in</OakP>
        </a>
      )}
    </>
  );
};

export default HeaderAuth;
