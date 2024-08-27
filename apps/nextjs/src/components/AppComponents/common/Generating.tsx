import { useEffect, useState } from "react";

import { Box, Flex } from "@radix-ui/themes";

import LoadingWheel from "@/components/LoadingWheel";

type GeneratingProps = {
  estimatedDurationMs?: number;
  showTime?: boolean;
};

// @todo once quiz designer is in action with streaming, we can remove show time

const Generating = ({
  estimatedDurationMs,
  showTime = true,
}: Readonly<GeneratingProps>) => {
  const fallbackDuration = 18000;

  // Calculate the duration in seconds, padding it by 2 to err on the
  // side of returning early rather than late
  const estimatedDurationSeconds = Math.round(
    (estimatedDurationMs ?? fallbackDuration) / 1000 + 2,
  );

  const [countdown, setCountdown] = useState(estimatedDurationSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex direction="row" align="center">
      <LoadingWheel />
      <Box className="max-w-[90%]">
        {showTime && estimatedDurationMs ? (
          <>
            {countdown > 0 ? (
              <Flex direction="column">
                <p className="mb-2 text-sm">Working on it! </p>
                <p className="text-sm opacity-80">
                  Average time for this request: {countdown}s
                </p>
              </Flex>
            ) : (
              <p className="max-w-[260px] text-sm">
                This is taking longer than usual, just one more moment
              </p>
            )}
          </>
        ) : null}
      </Box>
    </Flex>
  );
};

export default Generating;
