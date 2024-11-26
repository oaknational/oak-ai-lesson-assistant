import { OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

export function DialogContainer({ children }: { readonly children: React.ReactNode }) {
  return (
    <OakFlex
      $flexDirection={"column"}
      $justifyContent={"center"}
      $alignItems={"flex-start"}
      $gap="all-spacing-4"
      $height={"100%"}
      $width={"100%"}
    >
      {children}
    </OakFlex>
  );
}

export function DialogHeading({ children }: { readonly children: React.ReactNode }) {
  return (
    <OakHeading tag="h1" $font={"heading-5"}>
      {children}
    </OakHeading>
  );
}

export function DialogContent({ children }: { readonly children: React.ReactNode }) {
  return <OakP $font={"body-3"}>{children}</OakP>;
}
