import React from "react";

import Link from "next/link";

import FullPageWarning from "@/components/FullPageWarning";

export const AccountLocked = () => {
  return (
    <FullPageWarning>
      <FullPageWarning.Icon icon="warning" size="lg" />

      <FullPageWarning.Header>Account locked</FullPageWarning.Header>

      <FullPageWarning.Content>
        Your activity may be in violation of our{" "}
        <Link href="https://www.thenational.academy/legal/terms-and-conditions">
          terms and conditions
        </Link>{" "}
        so your account has been locked. If this is an error, please contact us
        at{" "}
        <Link className="text-blue" href="mailto:help@thenational.academy">
          help@thenational.academy
        </Link>
        .
      </FullPageWarning.Content>

      <FullPageWarning.Button href="/">
        Go to AI Experiments
      </FullPageWarning.Button>
    </FullPageWarning>
  );
};

export default AccountLocked;
