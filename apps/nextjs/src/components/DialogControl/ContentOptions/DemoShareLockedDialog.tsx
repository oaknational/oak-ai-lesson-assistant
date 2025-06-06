import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";

import { useDemoUser } from "@/components/ContextProviders/Demo";

function DialogContainer({ children }: { readonly children: React.ReactNode }) {
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

const DemoShareLockedDialog = ({
  closeDialog,
}: {
  readonly closeDialog: () => void;
}) => {
  const { isDemoUser, demo } = useDemoUser();

  if (!isDemoUser) {
    return null;
  }

  return (
    <DialogContainer>
      <OakP $textAlign="center">
        Share and download options are not available to users outside of the UK.
        If you are a teacher in the UK,{" "}
        <a href={demo.contactHref} className="underline">
          contact us for full access.
        </a>
      </OakP>
      <OakFlex $justifyContent="center" $width="100%" $mt="space-between-m">
        <OakPrimaryButton onClick={closeDialog}>
          Back to lesson
        </OakPrimaryButton>
      </OakFlex>
    </DialogContainer>
  );
};

export default DemoShareLockedDialog;
