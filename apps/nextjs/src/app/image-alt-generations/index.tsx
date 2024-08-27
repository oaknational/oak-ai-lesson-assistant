"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  ImagesFromCloudinary,
  Resource,
} from "ai-apps/image-alt-generation/types";

import Button from "@/components/Button";
import HeroContainer from "@/components/HeroContainer";
import ImageRow from "@/components/ImageAltGenerator/ImageRow";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

export const ImageAltGen = (featureFlag) => {
  const [currentBatchData, setCurrentBatchData] =
    useState<ImagesFromCloudinary>(null);

  const resourcesFromTrpc = trpc.cloudinaryRouter.getCloundinaryImages.useQuery(
    { batchId: currentBatchData?.next_cursor ?? "" },
  );

  const nextBatchOfImages = useCallback(async () => {
    const nextBatch = resourcesFromTrpc.refetch();
    const nextBatchData = await nextBatch;

    setCurrentBatchData(nextBatchData.data as ImagesFromCloudinary);
  }, [resourcesFromTrpc]);

  useEffect(() => {
    if (!currentBatchData) {
      const data = resourcesFromTrpc.data;
      setCurrentBatchData(data as ImagesFromCloudinary);
    }
  }, [resourcesFromTrpc, currentBatchData]);

  return (
    <Layout featureFlag={featureFlag}>
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
      {currentBatchData && currentBatchData.resources.length > 0 ? (
        <>
          <Box>
            {currentBatchData?.resources?.map((resource: Resource) => {
              return <ImageRow resource={resource} key={resource.secure_url} />;
            })}
          </Box>
          <Flex gap="5" justify="end">
            <Button
              variant="primary"
              icon="arrow-right"
              onClick={() => nextBatchOfImages()}
            >
              Load more images
            </Button>
          </Flex>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Layout>
  );
};
