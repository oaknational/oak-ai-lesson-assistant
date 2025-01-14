import type { Client } from "@elastic/elasticsearch";

export type SearchResponseBody = Awaited<ReturnType<Client["search"]>>;
