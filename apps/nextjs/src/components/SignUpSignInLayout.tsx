"use client";

import { Transition } from "@headlessui/react";
import { OakBox, OakFlex, OakMaxWidth } from "@oaknational/oak-components";
import Image from "next/image";

import jigsaw from "@/assets/svg/illustration/jigsaw.svg";

import HeroContainer from "./HeroContainer";
import { StatusBanner } from "./StatusBanner";

type SignUpSignInLayoutProps = {
  children: React.ReactNode;
  loaded: boolean;
};
const SignUpSignInLayout = ({
  children,
  loaded,
}: Readonly<SignUpSignInLayoutProps>) => {
  return (
    <>
      {/* The hero below shifts itself up by 72px to fill the gap where the header
          would normally be, so the banner has to sit on top of it to stay visible.
          It lands in the hero's empty top padding, so it covers nothing. */}
      <OakBox $position="relative" $zIndex="in-front">
        <StatusBanner />
      </OakBox>
      <HeroContainer>
        <OakMaxWidth>
          <OakFlex
            $flexDirection={["column", "row"]}
            $alignItems="center"
            $justifyContent={["center", "space-between"]}
          >
            <OakFlex
              $alignItems="center"
              $justifyContent="center"
              $minHeight="100vh"
            >
              <Transition
                show={Boolean(loaded)}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {children}
              </Transition>
            </OakFlex>

            <OakBox $textAlign="center">
              <Image
                src={jigsaw}
                alt="Magic Carpet"
                className="m-auto"
                width={400}
                height={400}
                priority
              />
            </OakBox>
          </OakFlex>
        </OakMaxWidth>
      </HeroContainer>
    </>
  );
};

export default SignUpSignInLayout;
