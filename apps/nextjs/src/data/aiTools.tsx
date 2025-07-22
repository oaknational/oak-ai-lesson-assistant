import oakSupporting from "@/assets/svg/illustration/oak_supporting.svg";
import { getAilaUrl } from "@/utils/getAilaUrl";

export const aiTools: {
  title: string;
  href: string;
  id: "lesson-planner" | "quiz-designer";
  image: string;
  behindFeatureFlag: boolean;
  description: string;
}[] = [
  {
    title: "Create with AI",
    href: getAilaUrl("start"),
    id: "lesson-planner",
    image: oakSupporting,
    behindFeatureFlag: true,
    description:
      "Save time creating lessons with our AI lesson planning assistant. Tailor high-quality resources to suit your pupils and export them in classroom-ready formats.",
  },
];
