/*
 *
 * Keeping this component in the codebase as can be reused for as a banner for other features
 * @todo sync with OWA through oak components
 *
 */
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
        $background={"bg-decorative5-main"}
        $justifyContent={["center"]}
        $alignItems={"center"}
        $pv={"spacing-12"}
        $ph={["spacing-12", "spacing-16"]}
      >
        <OakFlex
          $alignItems={"center"}
          $flexWrap={"wrap"}
          $gap={["spacing-16", "spacing-40"]}
          $flexDirection={["column", "row"]}
          $justifyContent={"center"}
          $pv={"spacing-0"}
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
