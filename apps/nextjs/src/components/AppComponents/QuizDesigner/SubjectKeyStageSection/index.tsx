import {
  KeyStageName,
  SubjectName,
} from "@oakai/core/src/data/subjectsAndKeyStages";

import Choose from "./Choose";
import Confirmed from "./Confirmed";

interface SubjectKeyStageInputProps {
  keyStage: KeyStageName;
  setKeyStage: (keyStage: KeyStageName) => void;
  subject: SubjectName;
  setSubject: (subject: SubjectName) => void;
  topic?: string;
  setTopic: (topic: string) => void;
  hasStartedApp: boolean;
  direction?: "row" | "column";
  app?: "lesson-planner" | "quiz-designer";
}

const SubjectKeyStageSection = ({
  keyStage,
  setKeyStage,
  subject,
  setSubject,
  topic,
  setTopic,
  hasStartedApp,
  direction,
  app,
}: Readonly<SubjectKeyStageInputProps>) => {
  return (
    <div className="w-full">
      {hasStartedApp ? (
        app !== "lesson-planner" && (
          <Confirmed subject={subject} keyStage={keyStage} topic={topic} />
        )
      ) : (
        <Choose
          keyStage={keyStage}
          setSelectedSubject={setSubject}
          setSelectedKeyStage={setKeyStage}
          topic={topic}
          setTopic={setTopic}
          selectedSubject={subject}
          direction={direction}
        />
      )}
    </div>
  );
};

export default SubjectKeyStageSection;
