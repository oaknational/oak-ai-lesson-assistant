import { fetchAiHomepage } from "cms/data/fetchAiHomepage";

import HomePage from "./home-page";

export default async function Page() {
  const result = await fetchAiHomepage();
  console.log("test");
  return <HomePage pageData={result} />;
}
