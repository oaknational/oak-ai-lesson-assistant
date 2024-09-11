import { useCallback, useEffect, useState } from "react";

import { Flex } from "@radix-ui/themes";
import { captureMessage } from "@sentry/nextjs";

import { DialogTitle } from "@/components/AppComponents/Chat/ui/dialog";
import Button from "@/components/Button";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import LoadingWheel from "@/components/LoadingWheel";

function friendlyNumber(
  appSessionsRemaining: number | undefined,
  appSessionsPerMonth: number,
) {
  if (typeof appSessionsRemaining === "undefined") {
    return "";
  }
  const number = appSessionsPerMonth - appSessionsRemaining + 1;

  if (number === 1) {
    return "first ";
  } else if (number === 2) {
    return "second ";
  } else if (number === 3) {
    return "third ";
  } else {
    captureMessage(`Unknown number of sessions remaining: ${number}`);
    return "";
  }
}

function DialogContainer({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      className="h-full w-full gap-10"
      direction="column"
      justify="start"
      align="start"
    >
      {children}
    </Flex>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DialogTitle className="sr-only">{children}</DialogTitle>
      <p className="text-2xl font-bold">{children}</p>
    </>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

const CreatingChatDialog = ({
  submit,
  closeDialog,
}: {
  submit?: () => void;
  closeDialog: () => void;
}) => {
  const demo = useDemoUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appSessionsRemaining, setAppSessionsRemaining] = useState<
    number | undefined
  >(demo.isDemoUser ? demo.appSessionsRemaining : undefined);

  // Don't update the remaining count while submitting as the mutation will change it
  useEffect(() => {
    if (demo.isDemoUser && !isSubmitting) {
      setAppSessionsRemaining(demo.appSessionsRemaining);
    }
  }, [isSubmitting, demo]);

  const createAppSession = useCallback(async () => {
    if (!submit) {
      throw new Error("DemoInterstitialDialog requires a submit function");
    }

    setIsSubmitting(true);

    try {
      await submit();
    } catch (error) {
      console.error("Error creating demo lesson:", error);
      setIsSubmitting(false);
    }
  }, [submit]);

  if (!demo.isDemoUser) {
    return null;
  }

  if (appSessionsRemaining === 0) {
    return (
      <DialogContainer>
        <Heading>Lesson limit reached</Heading>
        <Content>
          You have created {demo.appSessionsPerMonth} of your{" "}
          {demo.appSessionsPerMonth} lessons available this month. If you are a
          teacher in the UK, please{" "}
          <a href={demo.contactHref} className="underline">
            contact us for full access.
          </a>
        </Content>

        <div className="flex w-full items-center justify-between">
          <Button variant="text-link" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="primary" onClick={closeDialog}>
            Back to Aila
          </Button>
        </div>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer>
      <Heading>
        Your {friendlyNumber(appSessionsRemaining, demo.appSessionsPerMonth)}
        demo lesson…
      </Heading>
      <Content>
        You can create {demo.appSessionsPerMonth} chats per month. If you are a
        teacher in the UK and want to create more lessons,{" "}
        <a href={demo.contactHref} className="underline">
          contact us for full access.
        </a>
      </Content>

      <div className="flex w-full items-center justify-between">
        <Button variant="text-link" onClick={closeDialog}>
          Cancel
        </Button>
        {!isSubmitting && (
          <Button variant="primary" onClick={() => createAppSession()}>
            Continue with lesson
          </Button>
        )}
        {isSubmitting && (
          <Button variant="primary" onClick={() => {}}>
            <LoadingWheel icon="reload-white" size="sm" />
            Continue with lesson
          </Button>
        )}
      </div>
    </DialogContainer>
  );
};

export default CreatingChatDialog;
