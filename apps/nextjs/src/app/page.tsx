import { fetchAiHomepage } from "cms/data/fetchAiHomepage";

import HomePage from "./home-page";

export default async function Page() {
  const result = await fetchAiHomepage();
  return <HomePage pageData={result} />;
}
