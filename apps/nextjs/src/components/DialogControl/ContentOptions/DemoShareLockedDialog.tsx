import {
  OakFlex,
  OakLink,
  OakPrimaryButton,
} from "@oaknational/oak-components";

import { useDemoUser } from "@/components/ContextProviders/Demo";

import {
  DialogContainer,
  DialogContent,
  DialogHeading,
} from "./DemoSharedComponents";

const DemoShareLockedDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const demo = useDemoUser();

  if (!demo.isDemoUser) {
    return null;
  }

  return (
    <DialogContainer>
      <DialogHeading>Sharing and downloading</DialogHeading>
      <DialogContent>
        Share and download options are not available to users outside of the UK.
        If you are a teacher in the UK,{" "}
        <OakLink color="inherit" href={demo.contactHref}>
          contact us for full access.
        </OakLink>
      </DialogContent>

      <OakFlex
        $width={"100%"}
        $alignItems={"center"}
        $justifyContent={"space-between"}
      >
        <OakPrimaryButton onClick={closeDialog}>
          Back to lesson
        </OakPrimaryButton>
      </OakFlex>
    </DialogContainer>
  );
};

export default DemoShareLockedDialog;
