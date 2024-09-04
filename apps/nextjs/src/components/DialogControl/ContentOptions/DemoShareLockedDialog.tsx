import { Flex } from "@radix-ui/themes";

import { DialogTitle } from "@/components/AppComponents/Chat/ui/dialog";
import Button from "@/components/Button";
import { useDemoUser } from "@/components/ContextProviders/Demo";

function DialogContainer({ children }: { children: React.ReactNode }) {
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

function Heading({ children }: { children: React.ReactNode }) {
  return <p className="text-2xl font-bold">{children}</p>;
}

function Content({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

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
      <DialogTitle className="sr-only">Sharing and downloading</DialogTitle>
      <Heading>Sharing and downloading</Heading>
      <Content>
        Share and download options are not available to users outside of the UK.
        If you are a teacher in the UK,{" "}
        <a href={demo.contactHref} className="underline">
          contact us for full access.
        </a>
      </Content>

      <div className="flex w-full items-center justify-between">
        <div />
        <Button variant="primary" onClick={closeDialog}>
          Back to lesson
        </Button>
      </div>
    </DialogContainer>
  );
};

export default DemoShareLockedDialog;
