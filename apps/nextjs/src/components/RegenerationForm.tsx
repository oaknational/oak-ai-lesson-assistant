import React, { useState } from "react";

import { OakIcon } from "@oaknational/oak-components";
import * as Dialog from "@radix-ui/react-dialog";

import LoadingWheel from "@/components/LoadingWheel";

import { Icon } from "./Icon";

interface RegenerationFormProps {
  onSubmit: (feedback: string) => Promise<void>;
  imageSource: string;
}

export const RegenerationForm: React.FC<RegenerationFormProps> = ({
  onSubmit,
  imageSource,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(feedback);
      setIsOpen(false);
      setFeedback("");
    } catch (error) {
      console.error("Error regenerating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2">
          <Icon icon="reload" size="sm" color="white" />
          Regenerate with {imageSource}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Regenerate Image
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-2">
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700"
              >
                What would you like to change about this image?
              </label>
              <textarea
                id="feedback"
                placeholder="e.g., Make the colors more vibrant, add more detail to..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="focus:border-blue-500 focus:ring-blue-500 min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1"
                required
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="focus:ring-blue-500 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !feedback.trim()}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <LoadingWheel /> : "Submit"}
              </button>
            </div>
          </form>

          <Dialog.Close className="focus:ring-blue-500 absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2">
            <OakIcon iconName="cross" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
