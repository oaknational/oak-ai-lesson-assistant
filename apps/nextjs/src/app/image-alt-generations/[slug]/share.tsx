"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import decode from "base64url";

import HeroContainer from "@/components/HeroContainer";
import ImageRow from "@/components/ImageAltGenerator/ImageRow";
import Layout from "@/components/Layout";

export const ShareAlt = (props: {
  slug: string;
  featureFlag: boolean | undefined;
}) => {
  const decoder = decode.decode;
  console.log("props", props.slug);
  const decodedSlug = decoder(props.slug);
  console.log("decodedSlug", decodedSlug);
  const parsedSlug = JSON.parse(decodedSlug);
  console.log("parsedSlug", parsedSlug);
  return (
    <Layout featureFlag={!!props.featureFlag}>
      <HeroContainer>
        <Flex
          direction="column"
          align="baseline"
          gap="3"
          mb="5"
          position="relative"
          className="z-10"
        >
          <Heading size="8" className="text-xxl">
            Generate Alt Text
          </Heading>
          <Text align="left" className="max-w-[500px] ">
            Use this tool to generate alt text for images.
          </Text>
        </Flex>
      </HeroContainer>
      <Box>
        <ImageRow
          resource={parsedSlug}
          key={parsedSlug.secure_url}
          isPreview={true}
        />
      </Box>
    </Layout>
  );
};
