import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import FAQPage from ".";

const FAQ = async () => {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");

  if (!featureFlag) {
    return null;
  }

  return <FAQPage featureFlag={featureFlag} />;
};

export default FAQ;
