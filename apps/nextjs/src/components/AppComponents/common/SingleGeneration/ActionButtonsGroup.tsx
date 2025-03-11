import { Box, Flex } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";

import EditGenerationButton from "./EditGenerationButton";
import FlagContentButton from "./FlagContentButton";

const ActionButtonsGroup = ({
  userIsEditing,
  toggleEditState,
  isLoading,
  requestRegenerate,
  disabled,
}: Readonly<ActionButtonsGroupProps>) => {
  return (
    <Flex
      direction="row"
      mt="2"
      justify="start"
      className="mt-10 w-fit gap-8 rounded bg-pink50 px-9 py-5"
      align="center"
    >
      {!!requestRegenerate && (
        <>
          <ReloadDistractorButton
            userIsEditing={userIsEditing}
            onClick={requestRegenerate}
            isLoading={isLoading}
            disabled={disabled}
          />
          <Box className="h-[50%] w-2 bg-black opacity-25" />
        </>
      )}

      <EditGenerationButton
        userIsEditing={userIsEditing}
        onClick={toggleEditState}
        isLoading={isLoading}
        disabled={disabled}
      />

      <Box className="h-[50%] w-2 bg-black opacity-25" />

      <FlagContentButton />
    </Flex>
  );
};

function ReloadDistractorButton(props: Readonly<ReloadDistractorButtonProps>) {
  return (
    <button
      className="flex items-center"
      disabled={props.userIsEditing || props.isLoading || props.disabled}
      onClick={() => {
        props.onClick();
      }}
    >
      <Icon
        icon="reload"
        size="xs"
        color="black"
        className={props.isLoading ? "animate-spin" : ""}
      />
      <span className="ml-4 text-base">Regenerate</span>
    </button>
  );
}
type ActionButtonsGroupProps = {
  userIsEditing: boolean;
  toggleEditState: () => void;
  isLoading: boolean;
  requestRegenerate?: () => void;
  disabled?: boolean;
};

type ReloadDistractorButtonProps = {
  userIsEditing: boolean;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export default ActionButtonsGroup;
