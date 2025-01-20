import { useCallback, useState } from "react";

import { aiLogger } from "@oakai/logger";
import { Box, Flex } from "@radix-ui/themes";
import encode from "base64url";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Resource } from "@/ai-apps/image-alt-generation/types";
import { trpc } from "@/utils/trpc";

import Button from "../Button";
import LoadingWheel from "../LoadingWheel";

const log = aiLogger("ui");

export type ImageRowProps = Readonly<{
  readonly resource: Resource;
  readonly isPreview?: boolean;
}>;
const ImageRow = ({ resource, isPreview }: ImageRowProps) => {
  const router = useRouter();
  const [newAlt, setNewAlt] = useState<string | null | undefined>();
  const [newAltForQuiz, setNewAltForQuiz] = useState<
    string | null | undefined
  >();

  // Generates alt text
  const generateAltTextTrpc = trpc.cloudinaryRouter.generateAltText.useQuery({
    imageUrl: resource.url,
    alt: newAlt,
  });

  const getAltText = useCallback(async () => {
    setNewAlt(generateAltTextTrpc.data);
    generateAltTextTrpc.refetch();
  }, [generateAltTextTrpc]);

  // // Generates alt text for quiz use
  const generateQuizAltTextTrpc =
    trpc.cloudinaryRouter.generateQuizAltText.useQuery({
      imageUrl: resource.url,
      alt: newAltForQuiz,
    });

  const getQuizAltText = useCallback(async () => {
    setNewAltForQuiz(generateQuizAltTextTrpc.data);
    generateQuizAltTextTrpc.refetch();
  }, [generateQuizAltTextTrpc, setNewAltForQuiz]);

  // Handle upload to cloudinary
  const uploadToCloudinaryTrpc =
    trpc.cloudinaryRouter.uploadToCloudinary.useMutation();

  const uploadToCloudinary = useCallback(async () => {
    if (typeof generateAltTextTrpc.data === "string") {
      uploadToCloudinaryTrpc.mutateAsync({
        alt: generateQuizAltTextTrpc.data ?? "",
        publicId: resource.public_id,
      });
    }
  }, [
    uploadToCloudinaryTrpc,
    resource.public_id,
    generateQuizAltTextTrpc.data,
    generateAltTextTrpc.data,
  ]);

  function shareRow() {
    const shareData = {
      secure_url: resource.secure_url,
      url: resource.url,
      width: resource.width,
      height: resource.height,
      public_id: resource.public_id,
      context: resource.context,
    };

    const encodedResource = encode(JSON.stringify(shareData));
    log.info("encodedResource", encodedResource);
    router.push(`/image-alt-generations/${encodedResource}`);
  }

  if (
    (resource.width &&
      resource.height &&
      resource.secure_url &&
      resource.context?.alt &&
      !resource.context.gptGenerated) ||
    (resource?.context?.gptGenerated && isPreview)
  ) {
    return (
      <Flex
        direction="column"
        justify="end"
        align="start"
        className="mb-20 border-b border-black border-opacity-20 pb-20 first:mt-25"
      >
        <Flex
          direction={{
            initial: "column",
            sm: "row",
          }}
          justify="between"
          align="center"
        >
          <Flex
            className="w-[500px] pr-30"
            direction="column"
            justify="start"
            width="100%"
            height="100%"
          >
            <Image
              src={resource.secure_url}
              width={resource.width}
              height={resource.height}
              alt="this image needs an alt"
            />

            {!isPreview && (
              <Box
                mt="8"
                pt="8"
                className="border-opacity border-t border-black border-opacity-20"
              >
                <Button
                  variant="text-link"
                  icon="share"
                  iconPosition="leading"
                  onClick={() => shareRow()}
                >
                  Share
                </Button>
              </Box>
            )}
          </Flex>
          <Box className="max-w-[600px]">
            <Box mb={"6"}>
              <Box mb="3">
                <p className="text-base font-bold">From cloudinary:</p>
              </Box>
              <p>{resource?.context?.alt}</p>
            </Box>
            <Box mb={"4"}>
              <Flex justify="between" width="100%" align="center" mb="2">
                <p className="text-base font-bold">From GPT:</p>
                <Button
                  variant="text-link"
                  icon="reload"
                  onClick={() => getAltText()}
                >
                  Retry
                </Button>
              </Flex>
              {generateAltTextTrpc.isRefetching ||
                (generateAltTextTrpc.isLoading && <LoadingWheel />)}

              {generateAltTextTrpc.data && <p>{generateAltTextTrpc.data}</p>}
            </Box>
            <Flex gap="5" justify="start" mb="6">
              {uploadToCloudinaryTrpc.isLoading ? (
                <LoadingWheel />
              ) : (
                <Button
                  variant="text-link"
                  icon="arrow-up"
                  onClick={() => uploadToCloudinary()}
                >
                  Upload to cloudinary
                </Button>
              )}
            </Flex>
            <Box mb="4">
              <Flex justify="between" align="center" mb="3">
                <p className="text-base font-bold">From GPT for in quiz use:</p>
                <Button
                  variant="text-link"
                  icon="reload"
                  onClick={() => getQuizAltText()}
                >
                  Retry
                </Button>
              </Flex>

              {generateQuizAltTextTrpc.isRefetching ||
                (generateQuizAltTextTrpc.isLoading && <LoadingWheel />)}

              {generateQuizAltTextTrpc.data && (
                <p>{generateQuizAltTextTrpc.data}</p>
              )}
            </Box>
            <Flex gap="5" justify="start">
              <Button variant="text-link" icon="arrow-up" disabled={true}>
                Upload to cloudinary
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    );
  }
  return (
    <Flex
      direction="row"
      justify="between"
      align="center"
      className="mb-20 border-b border-black border-opacity-20 pb-20 first:mt-25"
    >
      <p>
        This image is missing some data. Try uploading it to cloudinary again.
      </p>
    </Flex>
  );
};

export default ImageRow;
