import { useCallback, useState } from "react";

import * as Sentry from "@sentry/react";

export const useExportsExistenceCheck = <T>({
  success,
  data,
  chatId,
  messageId,
  checkFn,
}: {
  success?: boolean;
  data?: T;
  chatId: string;
  messageId?: string;
  checkFn: (arg: { chatId: string; data: T; messageId: string }) => void;
}) => {
  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (success && data && !checked) {
      try {
        if (!messageId) {
          throw new Error("messageId is undefined");
        }
        checkFn({
          chatId,
          data,
          messageId,
        });
        setChecked(true);
      } catch (cause) {
        const error = new Error("Failed to check for existing export", {
          cause,
        });
        Sentry.captureException(error, {
          extra: { chatId, data, messageId },
        });
      }
    }
  }, [success, data, chatId, checkFn, checked, setChecked, messageId]);

  return check;
};
