import { useCallback, useEffect, useState } from "react";

import { aiLogger } from "@oakai/logger";

import {
  OakFlex,
  OakLink,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";
import { captureMessage } from "@sentry/nextjs";

import { useDemoUser } from "@/components/ContextProviders/Demo";

import { DialogContainer } from "./DemoSharedComponents";

const log = aiLogger("demo");

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

export type CreatingChatDialogProps = Readonly<{
  submit?: () => void;
  closeDialog: () => void;
}>;

const CreatingChatDialog = ({
  submit,
  closeDialog,
}: CreatingChatDialogProps) => {
  const { isDemoUser, demo } = useDemoUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appSessionsRemaining, setAppSessionsRemaining] = useState<
    number | undefined
  >(isDemoUser ? demo.appSessionsRemaining : undefined);

  // Don't update the remaining count while submitting as the mutation will change it
  useEffect(() => {
    if (isDemoUser && !isSubmitting) {
      setAppSessionsRemaining(demo.appSessionsRemaining);
    }
  }, [isSubmitting, isDemoUser, demo]);

  const createAppSession = useCallback(() => {
    if (!submit) {
      throw new Error("DemoInterstitialDialog requires a submit function");
    }

    setIsSubmitting(true);

    try {
      submit();
    } catch (error) {
      log.error("Error creating demo lesson:", error);
      setIsSubmitting(false);
    }
  }, [submit]);

  if (!isDemoUser) {
    return null;
  }

  if (appSessionsRemaining === 0) {
    return (
      <DialogContainer>
        <OakP>
          You have created {demo.appSessionsPerMonth} of your{" "}
          {demo.appSessionsPerMonth} lessons available this month. If you are a
          teacher in the UK, please{" "}
          <OakLink href={demo.contactHref}>contact us for full access.</OakLink>
        </OakP>

        <OakFlex
          $width={"100%"}
          $alignItems={"center"}
          $justifyContent="flex-end"
        >
          <OakPrimaryButton onClick={closeDialog}>
            Back to Aila
          </OakPrimaryButton>
        </OakFlex>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer>
      <OakP>
        Your {friendlyNumber(appSessionsRemaining, demo.appSessionsPerMonth)}
        demo lesson…
      </OakP>
      <OakP>
        You can create {demo.appSessionsPerMonth} lessons per month. If you are
        a teacher in the UK and want to create more lessons,{" "}
        <OakLink href={demo.contactHref}>contact us for full access.</OakLink>
      </OakP>

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
