import {
  OakBox,
  OakFlex,
  OakSpan,
  OakTypography,
} from "@oaknational/oak-components";
import Link from "next/link";

const TempBanner = () => {
  return (
    <OakBox role="banner" $bt="border-solid-m" $bb="border-solid-m">
      <OakFlex
        $background={"lemon"}
        $justifyContent={["center"]}
        $alignItems={"center"}
        $pv={"inner-padding-s"}
        $ph={["inner-padding-s", "inner-padding-m"]}
      >
        <OakFlex
          $alignItems={"center"}
          $flexWrap={"wrap"}
          $gap={["all-spacing-4", "all-spacing-8"]}
          $flexDirection={["column", "row"]}
          $justifyContent={"center"}
          $pv={"inner-padding-none"}
        >
          <OakTypography $font={["body-3", "body-2"]} $textAlign={"center"}>
            Want to learn more about integrating AI into your teaching
            practices?{" "}
            <Link
              href="https://share.hsforms.com/1USsrkazESq2Il8lxUx_vPgbvumd"
              target="_blank"
            >
              <OakSpan $textDecoration={"underline"}>
                Sign up for our webinar
              </OakSpan>
            </Link>
            .
          </OakTypography>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
};

export default TempBanner;
