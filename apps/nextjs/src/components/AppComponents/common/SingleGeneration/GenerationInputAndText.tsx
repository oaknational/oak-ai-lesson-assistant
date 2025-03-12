import { useEffect, useState } from "react";

import type {
  GenerationPart,
  GenerationPartPlaceholder,
} from "@oakai/core/src/types";

import { Text } from "@radix-ui/themes";

function GenerationInputAndText({
  item,
  index,
  userIsEditing,
  isLoading,
  tweak,
  setUserIsEditing,
  children,
}: Readonly<GenerationInputAndTextProps>) {
  /**
   * Make the Input a controlled component, but only update the state locally,
   * pushing it up to the global store onBlur
   *
   * This is so that we only fire one event that the user tweaked the value
   * instead of on every key-press. It also allows for undoing on closing "edit
   * mode" by setting inputValue back to answer.value
   */
  const [inputValue, setInputValue] = useState(item.value ?? "");

  useEffect(() => {
    setInputValue(item.value ?? "");
  }, [item.value]);

  return (
    <>
      <textarea
        className={`${
          userIsEditing ? "flex" : "hidden"
        } w-full rounded border border-black p-10`}
        value={inputValue}
        onChange={(evt) => {
          setInputValue(evt.target.value);
        }}
        onBlur={() => {
          /**
           * Only update if they've actually changed, otherwise we'll
           * accidentally mark fields as userTweaked if they focus it,
           *  but don't edit
           */
          if (inputValue !== item.value) {
            tweak(index, inputValue);
          }
          /**
           * Switch out of edit mode, so the user can't leave it without
           * saving it's state
           */
          setUserIsEditing(false);
        }}
      />
      <Text
        className={
          userIsEditing
            ? "hidden"
            : `flex text-lg ${isLoading && "line-through opacity-60"}`
        }
      >
        {children}
      </Text>
    </>
  );
}

type GenerationInputAndTextProps = {
  item: GenerationPart | GenerationPartPlaceholder;
  userIsEditing: boolean;
  isLoading: boolean;
  index: number;
  tweak: (index: number, text: string) => void;
  setUserIsEditing: (isEditing: boolean) => void;
  children: React.ReactNode;
};
export default GenerationInputAndText;
