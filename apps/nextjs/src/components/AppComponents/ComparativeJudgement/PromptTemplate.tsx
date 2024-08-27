import { useState } from "react";

import { Box, Flex } from "@radix-ui/themes";

import Button from "@/components/Button";

const PromptTemplate = ({
  template,
  identifier,
}: Readonly<{ template: string; identifier: string }>) => {
  const [showPrompt, setShowPrompt] = useState(false);
  return (
    <Flex direction={"column"} gap={"4"}>
      <Box my="3">
        <Button variant="text-link" onClick={() => setShowPrompt(!showPrompt)}>
          {showPrompt ? "Hide" : "See"} prompt
        </Button>
      </Box>
      {showPrompt && (
        <>
          <p>{slugToTitle(identifier)}</p>
          <pre className="max-w-full whitespace-pre-wrap break-words">
            {template}
          </pre>
        </>
      )}
    </Flex>
  );
};

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((word: string) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export default PromptTemplate;
