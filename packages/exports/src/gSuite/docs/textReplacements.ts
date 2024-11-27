import type { docs_v1 } from "@googleapis/docs";

import type { ValueToString } from "../../utils";

export async function textReplacements<
  Data extends Record<string, string | string[] | null | undefined>,
>({
  data,
  warnIfMissing,
  valueToString,
}: {
  data: Data;
  warnIfMissing: (keyof Data)[];
  valueToString: ValueToString<Data>;
}): Promise<{ requests: docs_v1.Schema$Request[]; missingData: string[] }> {
  const requests: docs_v1.Schema$Request[] = [];
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

  return { requests, missingData };
}
