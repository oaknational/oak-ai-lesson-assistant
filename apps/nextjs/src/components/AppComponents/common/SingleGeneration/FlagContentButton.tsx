import { Icon } from "@/components/Icon";

import { FeedbackDialogTrigger } from "./GenerationFeedbackDialog";

const FlagContentButton = () => {
  return (
    <FeedbackDialogTrigger asChild>
      <button className="flex items-center">
        <Icon icon="warning" size="xs" color="black" />
        <span className="ml-4 text-base">Flag</span>
      </button>
    </FeedbackDialogTrigger>
  );
};

export default FlagContentButton;
