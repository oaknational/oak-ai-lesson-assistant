import React from "react";

import FullPageWarning from "../components/FullPageWarning";

export default function NotFound() {
  return (
    <FullPageWarning>
      <FullPageWarning.Icon icon="acorn" size="xl" />

      <FullPageWarning.Header>404: Page not found</FullPageWarning.Header>

      <FullPageWarning.Content>
        The page you are looking for doesn’t exist. Try going back to the
        previous page, or head to the homepage
      </FullPageWarning.Content>

      <FullPageWarning.Button href="/">
        AI Experiments homepage
      </FullPageWarning.Button>
    </FullPageWarning>
  );
}
