import { OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

export function DialogContainer({ children }: { children: React.ReactNode }) {
  return (
    <OakFlex
      $flexDirection={"column"}
      $justifyContent={"center"}
      $alignItems={"start"}
      $gap="all-spacing-4"
    >
      {children}
    </OakFlex>
  );
}

export function DialogHeading({ children }: { children: React.ReactNode }) {
  return (
    <OakHeading tag="h1" $font={"heading-6"}>
      {children}
    </OakHeading>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <OakP $font={"body-3"} $color={"grey50"}>
      {children}
    </OakP>
  );
}
