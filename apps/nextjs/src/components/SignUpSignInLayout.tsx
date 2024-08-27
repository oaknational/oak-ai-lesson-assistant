"use client";

import { Transition } from "@headlessui/react";
import { OakBox, OakFlex, OakMaxWidth } from "@oaknational/oak-components";
import Image from "next/image";

import jigsaw from "@/assets/svg/illustration/jigsaw.svg";

import HeroContainer from "./HeroContainer";

type SignUpSignInLayoutProps = {
  children: React.ReactNode;
  loaded: boolean;
};
const SignUpSignInLayout = ({
  children,
  loaded,
}: Readonly<SignUpSignInLayoutProps>) => {
  return (
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
  );
};

export default SignUpSignInLayout;
