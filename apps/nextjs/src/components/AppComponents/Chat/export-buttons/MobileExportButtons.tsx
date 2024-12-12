import { OakIcon, OakSmallSecondaryButton } from "@oaknational/oak-components";
import Link from "next/link";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";

import { useDialog } from "../../DialogContext";

export type MobileExportButtonsProps = Readonly<{
  closeMobileLessonPullOut: () => void;
}>;

export const MobileExportButtons = ({
  closeMobileLessonPullOut,
}: MobileExportButtonsProps) => {
  const { id } = useLessonChat();
  const { setDialogWindow } = useDialog();
  const demo = useDemoUser();

  return (
    <>
      <div className="ml-[-10px] mt-27 flex justify-between px-14 pt-6 sm:hidden">
        <button
          onClick={() => {
            closeMobileLessonPullOut();
          }}
          className={`${demo.isDemoUser ? "mt-25" : ""} flex items-center justify-center gap-3 `}
        >
          <span className="scale-75">
            <OakIcon iconName="cross" />
          </span>
          <span className="text-base font-bold">Hide lesson</span>
        </button>
      </div>
      <div className="sticky top-25 z-10 flex gap-10 bg-white p-12 sm:hidden">
        <OakSmallSecondaryButton
          element={Link}
          iconName="download"
          href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
          onClick={() => {
            if (!demo.isSharingEnabled) {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          Download
        </OakSmallSecondaryButton>
        <OakSmallSecondaryButton
          iconName="share"
          onClick={() => {
            if (demo.isSharingEnabled) {
              setDialogWindow("share-chat");
            } else {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          Share
        </OakSmallSecondaryButton>
      </div>
    </>
  );
};
