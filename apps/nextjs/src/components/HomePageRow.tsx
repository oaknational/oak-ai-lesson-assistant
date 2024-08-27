import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";

import ChatButton from "./AppComponents/Chat/ui/chat-button";

type HomePageRowProps = {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  href?: string;
  comingSoon?: boolean;
  bg?: string;
  featureFlag?: boolean;
};

const HomePageRow = ({
  title,
  description,
  href,
  image,
  buttonText,
  comingSoon,

  bg,
  featureFlag,
}: Readonly<HomePageRowProps>) => {
  const userCanView = featureFlag;
  const displayComingSoon = !userCanView && comingSoon;
  return (
    <Flex
      justify="between"
      direction={{
        initial: "column",
        sm: "row-reverse",
      }}
      py="9"
      align="center"
      gap="8"
      className={`${bg} relative after:${bg} after:top:0 bg-[#E3E9FB] py-27 before:absolute before:left-[-50vw] before:top-0 before:z-[-1] before:h-full before:w-[150vw] before:bg-[#E3E9FB] after:absolute after:left-[-50vw] after:z-[-1] after:h-full after:w-[150vw]`}
    >
      <Box className="mx-auto mb-10 max-w-[300px] sm:mx-0 sm:max-w-[400px] md:mb-0">
        <Image src={image} alt="jigsaw image" />
      </Box>
      <Flex direction="column" gap="4">
        <Flex gap="3" direction="column">
          {title === "AI lesson planning assistant" && featureFlag && (
            <div className="w-fit">
              <span className="flex h-[32px] items-center justify-center rounded-full bg-teachersPastelBlue px-6 py-1 text-sm font-bold">
                Early beta access
              </span>
            </div>
          )}
          <Heading size="8" my="3">
            {title}
          </Heading>
        </Flex>

        <Text align="left" mb="3">
          {description}
        </Text>
        <ChatButton
          variant={displayComingSoon ? "text-link" : "primary"}
          href={href}
          disabled={displayComingSoon}
          icon="arrow-right"
        >
          {displayComingSoon ? "Coming soon" : buttonText}
        </ChatButton>
      </Flex>
    </Flex>
  );
};

export default HomePageRow;
