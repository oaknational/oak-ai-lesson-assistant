import { Dispatch, Fragment } from "react";

import { Dialog, Transition } from "@headlessui/react";

import { MainNavigationMenu } from "./MainNavigationMenu";

export type MainNavigationProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<React.SetStateAction<boolean>>;
  featureFlag: boolean | { featureFlag: boolean };
};

export default function MainNavigation({
  menuOpen,
  setMenuOpen,
  featureFlag,
}: Readonly<MainNavigationProps>) {
  return (
    <Transition show={menuOpen} as={Fragment}>
      <Dialog
        unmount={false}
        onClose={() => setMenuOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex h-screen">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in duration-600"
            enterFrom="transition-opacity ease-in duration-600 opacity-0"
            enterTo="transition-opacity ease-in duration-600 opacity-30"
            entered="transition-opacity ease-in duration-600 opacity-30"
            leave="transition-opacity ease-out duration-600"
            leaveFrom="transition-opacity ease-in duration-600 opacity-30"
            leaveTo="transition-opacity ease-in duration-600 opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black" />
          </Transition.Child>

          <Transition.Child
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
                featureFlag={featureFlag}
              />
            )}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
