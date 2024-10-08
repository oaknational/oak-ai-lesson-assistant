import { useCallback, useEffect, useState } from "react";

import {
  OakFlex,
  OakLink,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";
import { captureMessage } from "@sentry/nextjs";

import { useDemoUser } from "@/components/ContextProviders/Demo";

import {
  DialogContainer,
  DialogContent,
  DialogHeading,
} from "./DemoSharedComponents";

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
        <DialogHeading>Lesson limit reached</DialogHeading>
        <DialogContent>
          You have created {demo.appSessionsPerMonth} of your{" "}
          {demo.appSessionsPerMonth} lessons available this month. If you are a
          teacher in the UK, please{" "}
          <OakLink color="inherit" href={demo.contactHref}>
            contact us for full access.
          </OakLink>
        </DialogContent>

        <OakFlex
          $width={"100%"}
          $alignItems={"center"}
          $justifyContent="space-between"
        >
          <OakSecondaryLink element="button" onClick={closeDialog}>
            Cancel
          </OakSecondaryLink>
          <OakPrimaryButton onClick={closeDialog}>
            Back to Aila
          </OakPrimaryButton>
        </OakFlex>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer>
      <DialogHeading>
        Your {friendlyNumber(appSessionsRemaining, demo.appSessionsPerMonth)}
        demo lesson…
      </DialogHeading>
      <DialogContent>
        You can create {demo.appSessionsPerMonth} chats per month. If you are a
        teacher in the UK and want to create more lessons,{" "}
        <OakLink color="inherit" href={demo.contactHref}>
          contact us for full access.
        </OakLink>
      </DialogContent>

      <OakFlex
        $width={"100%"}
        $alignItems={"center"}
        $justifyContent={"space-between"}
      >
        <OakSecondaryLink element="button" onClick={closeDialog}>
          Cancel
        </OakSecondaryLink>

        <OakPrimaryButton isLoading={isSubmitting} onClick={createAppSession}>
          Continue with lesson
        </OakPrimaryButton>
      </OakFlex>
    </DialogContainer>
  );
};

export default CreatingChatDialog;
