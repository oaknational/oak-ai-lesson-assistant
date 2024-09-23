import { useState } from "react";

import { type AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";
import { type Moderation } from "@oakai/db";
import { OakAccordion, OakPrimaryButton } from "@oaknational/oak-components";

import { trpc } from "@/utils/trpc";

function ModerationListItem({ moderation }: { moderation: Moderation }) {
  const { id, invalidatedAt } = moderation;
  const [invalidated, setInvalidated] = useState(Boolean(invalidatedAt));
  const invalidateModeration = trpc.admin.invalidateModeration.useMutation({
    onSuccess: () => setInvalidated(true),
  });
  return (
    <li
      key={moderation.id}
      className={`rounded-md border  p-4 shadow-sm ${invalidated ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-col space-y-8">
          <div className="flex items-center">
            <p className="font-medium capitalize">
              {getSafetyResult(moderation)}
            </p>
            <OakPrimaryButton
              iconName="cross"
              className="ml-auto"
              onClick={() =>
                invalidateModeration.mutateAsync({ moderationId: id })
              }
              isLoading={invalidateModeration.isLoading}
              disabled={!!invalidated}
            >
              {invalidated ? "Invalidated" : "Invalidate"}
            </OakPrimaryButton>
          </div>

          <blockquote className="border-l-4 bg-gray-50 p-4 pl-4 italic text-zinc-700 shadow-md">
            {moderation.justification}
          </blockquote>
          <div className="mt-2 space-x-2">
            {moderation.categories.map((category, index) => (
              <span
                key={index}
                className="inline-block rounded-md bg-zinc-300 px-8 py-4 text-xs font-semibold text-zinc-800"
              >
                {String(category)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export function AdminChatView({
  chat,
  moderations,
}: {
  chat: AilaPersistedChat;
  moderations: Moderation[];
}) {
  return (
    <>
      <h1 className="mb-18">{chat.lessonPlan.title}</h1>
      <h2 className="mb-4 text-2xl font-bold">Moderations</h2>
      <ul className="mb-18 space-y-4">
        {moderations.map((moderation) => {
          return (
            <ModerationListItem key={moderation.id} moderation={moderation} />
          );
        })}
      </ul>

      <h2 className="mb-4 text-2xl font-bold">Raw data</h2>
      <OakAccordion header="Chat raw" id="accordion-1">
        <pre>
          <code>{JSON.stringify(chat, null, 2)}</code>
        </pre>
      </OakAccordion>
      <OakAccordion header="Moderations raw" id="accordion-1">
        <pre>
          <code>{JSON.stringify(moderations, null, 2)}</code>
        </pre>
      </OakAccordion>
    </>
  );
}
