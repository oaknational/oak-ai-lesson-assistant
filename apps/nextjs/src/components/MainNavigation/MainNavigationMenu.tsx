import { Ref, forwardRef } from "react";

import { useAuth } from "@clerk/nextjs";
import { Box, Flex } from "@radix-ui/themes";
import { aiTools } from "data/aiTools";
import { socialMenuItems } from "data/menus";
import Image from "next/image";
import { usePathname } from "next/navigation";

import loopingLine from "@/assets/svg/looping-line-1.svg";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { MainNavigationProps } from ".";
import Button from "../Button";
import { Icon } from "../Icon";
import { MobileListItem } from "./MobileListItem";

const MainNavigationWithRef = (
  { menuOpen, setMenuOpen, featureFlag }: Readonly<MainNavigationProps>,
  ref: Ref<HTMLElement>,
) => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { track } = useAnalytics();
  return (
    <nav
      ref={ref}
      className="fixed bottom-0 right-0 top-0 z-50 h-screen w-full min-w-[60vw] bg-aqua p-22 md:w-[50vw]"
    >
      <Box position="absolute" className="right-[36px] top-[30px]">
        <Button
          variant="icon-only"
          size="lg"
          onClick={() => setMenuOpen(!menuOpen)}
          icon="cross"
        />
      </Box>
      <Flex justify="between" direction="column" className="h-full">
        <ul className="mt-[48px] flex w-full flex-col items-center sm:items-start sm:pr-[48px]">
          {aiTools.map((tool) => (
            <MobileListItem
              onClick={() => {
                if (tool.id === "lesson-planner") {
                  track.lessonAssistantAccessed({
                    product: "ai lesson assistant",
                    isLoggedIn: !!isSignedIn,
                    componentType: "hamburger_menu_button",
                  });
                }
              }}
              featureFlag={featureFlag}
              key={tool.id}
              item={tool}
              setMenuOpen={setMenuOpen}
              menuOpen={menuOpen}
            />
          ))}

          {!isSignedIn && (
            <>
              <li className="py-4">
                <Button
                  variant="text-link"
                  href="/sign-in"
                  size="lg"
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                  }}
                  active={pathname === "sign-in"}
                >
                  Sign in
                </Button>
              </li>
              <li className="py-4">
                <Button
                  variant="text-link"
                  href="/sign-up"
                  size="lg"
                  active={pathname === "sign-up"}
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                  }}
                >
                  Sign up
                </Button>
              </li>
            </>
          )}
        </ul>
        <div className="flex flex-col gap-10">
          <Button
            variant="text-link"
            href="https://thenational.academy"
            icon="external"
          >
            Back to Oak
          </Button>
          <div className="flex gap-5">
            {socialMenuItems.map((item) => {
              return (
                <a href={item.href} key={item.id}>
                  <Icon icon={item.icon} size="md" />
                </a>
              );
            })}
          </div>
        </div>
      </Flex>

      <Image
        src={loopingLine}
        alt="looping line"
        className="absolute bottom-0 right-0 -z-10 w-[80%] opacity-30"
      />
    </nav>
  );
};

export const MainNavigationMenu = forwardRef(MainNavigationWithRef);
