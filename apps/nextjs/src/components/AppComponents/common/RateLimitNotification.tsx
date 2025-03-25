import { useEffect, useState } from "react";

import type { RateLimitInfo } from "@oakai/api/src/types";

import { useUser } from "@clerk/nextjs";
import { Box, Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { trpc } from "@/utils/trpc";

import Button from "../../Button";

const notificationStyles = cva(
  [
    "text-center text-black",
    "top-[70px] z-50 w-full max-w-[100%] bg-lemon sm:max-w-[350px]",
    "shadow-xl duration-500",
    "border-2 border-black",
  ],
  {
    variants: {
      displayNotification: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
  },
);

type RateLimitNotificationProps = {
  rateLimit: RateLimitInfo | null;
};

const RateLimitNotification = ({
  rateLimit,
}: Readonly<RateLimitNotificationProps>) => {
  const user = useUser();
  const userEmail = user?.user?.primaryEmailAddress?.emailAddress;
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [displayNotification, setDisplayNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rateLimit?.isSubjectToRateLimiting && rateLimit.remaining > 3) {
        setDisplayNotification(true);
        setTimeout(() => {
          setDisplayNotification(false);
        }, 7000);
      } else {
        setDisplayNotification(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [rateLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasSubmitted) {
        setHasSubmitted(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasSubmitted, setHasSubmitted]);

  /*
   *  Sends a request to Gleap via post mark to request more generations
   */
  const requestMoreGenerations = trpc.app.requestMoreGenerations.useMutation();
  const requestMoreGenerationsFunction = async () => {
    const feedBackObject = {
      userEmail: userEmail as string,
      appSlug: "quiz-generator",
    };
    const result = await requestMoreGenerations.mutateAsync(feedBackObject);
    if (result) {
      setHasSubmitted(true);
    }
  };

  if (rateLimit?.isSubjectToRateLimiting === false) {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        position="fixed"
        right="0"
        className={notificationStyles()}
        p="3"
        ml="4"
      >
        <Text size={{ initial: "2", sm: "3" }}>
          ∞ generations available. You are a member of Oak National Academy.
        </Text>
      </Flex>
    );
  }

  if (rateLimit?.isSubjectToRateLimiting) {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        position="fixed"
        right="0"
        className={notificationStyles({ displayNotification })}
        p="3"
        ml="4"
      >
        {rateLimit.remaining < 1 ? (
          <>
            <Text size={{ initial: "2", sm: "3" }}>
              You have used {rateLimit.limit}/{rateLimit.limit} generations
              today.
            </Text>
            <Box mt="3">
              {hasSubmitted ? (
                <Text>
                  Thank you for submitting your request. We will review it
                  shortly.
                </Text>
              ) : (
                <Button
                  onClick={() => {
                    setHasSubmitted(false);
                    void requestMoreGenerationsFunction();
                  }}
                  variant="text-link"
                >
                  Request more
                </Button>
              )}
            </Box>
          </>
        ) : (
          <Text size={{ initial: "2", sm: "3" }}>
            You have{" "}
            <span className="font-bold">
              {rateLimit.remaining} / {rateLimit.limit}
            </span>{" "}
            generations remaining today.
          </Text>
        )}
      </Flex>
    );
  }

  return null;
};

export default RateLimitNotification;
