import type { SearchResponse } from "@elastic/elasticsearch/lib/api/types";

export type SearchResponseBody<T = unknown> = SearchResponse<T>;
