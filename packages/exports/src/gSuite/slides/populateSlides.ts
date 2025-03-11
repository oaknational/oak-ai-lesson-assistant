import type { slides_v1 } from "@googleapis/slides";

import type { Result } from "../../types";
import type { ValueToString } from "../../utils";
import { defaultValueToString } from "../../utils";

/**
 * @description Populates the template presentation with the given data.
 */
export async function populateSlides<
  Data extends Record<string, string | string[] | null | undefined>,
>({
  googleSlides,
  presentationId,
  data,
  warnIfMissing = [],
  valueToString = defaultValueToString,
}: {
  googleSlides: slides_v1.Slides;
  presentationId: string;
  data: Data;
  warnIfMissing?: (keyof Data)[];
  valueToString?: ValueToString<Data>;
}): Promise<Result<{ missingData: string[] }>> {
  try {
    const requests: slides_v1.Schema$Request[] = [];
    const missingData: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const valueStr = valueToString(key, value);
      if (!valueStr.trim() && warnIfMissing.includes(key)) {
        missingData.push(key);
      }
      requests.push({
        replaceAllText: {
          replaceText: valueStr,
          containsText: {
            text: `{{${key}}}`,
            matchCase: false,
          },
        },
      });
    });

    if (requests.length === 0) {
      return {
        data: {
          missingData,
        },
      };
    }

    await googleSlides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    return {
      data: {
        missingData,
      },
    };
  } catch (error) {
    return {
      error,
      message: "Failed to populate slides",
    };
  }
}
