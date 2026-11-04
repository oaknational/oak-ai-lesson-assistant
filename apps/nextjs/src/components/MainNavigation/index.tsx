import type { Dispatch } from "react";
import { Fragment } from "react";

import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { MainNavigationMenu } from "./MainNavigationMenu";

export type MainNavigationProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<React.SetStateAction<boolean>>;
};

export default function MainNavigation({
  menuOpen,
  setMenuOpen,
}: Readonly<MainNavigationProps>) {
  return (
    <Transition show={menuOpen} as={Fragment}>
      <Dialog
        unmount={false}
        onClose={() => setMenuOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex h-screen">
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-in duration-600"
            enterFrom="transition-opacity ease-in duration-600 opacity-0"
            enterTo="transition-opacity ease-in duration-600 opacity-30"
            entered="transition-opacity ease-in duration-600 opacity-30"
            leave="transition-opacity ease-out duration-600"
            leaveFrom="transition-opacity ease-in duration-600 opacity-30"
            leaveTo="transition-opacity ease-in duration-600 opacity-0"
          >
            {/* Headless UI 2 only closes on clicks outside a DialogPanel, and
                this dialog has none, so close on backdrop clicks explicitly */}
            <DialogBackdrop
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMenuOpen(false)}
            />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            {(ref) => (
              <MainNavigationMenu
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                ref={ref}
              />
            )}
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
