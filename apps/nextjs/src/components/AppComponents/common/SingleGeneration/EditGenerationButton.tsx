import { Icon } from "@/components/Icon";

type EditGenerationButtonProps = {
  userIsEditing: boolean;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
};

function EditGenerationButton(props: Readonly<EditGenerationButtonProps>) {
  return (
    <button
      onClick={() => {
        props.onClick();
      }}
      disabled={props.isLoading || props.disabled}
      className="flex items-center"
    >
      <Icon
        icon={props.userIsEditing ? "save" : "equipment"}
        size="xs"
        color="black"
      />
      <span className="ml-4 text-base">
        {props.userIsEditing ? "Save" : "Edit"}
      </span>
    </button>
  );
}

export default EditGenerationButton;
