import { aiLogger } from "@oakai/logger";

import { TemplateProps } from "..";
import { allSectionsInOrder } from "../../../../../../apps/nextjs/src/lib/lessonPlan/sectionsInOrder";
import {
  LessonPlanKeys,
  LooseLessonPlan,
} from "../../../../../aila/src/protocol/schema";

interface LessonConstructionStep {
  title: string;
  content: string;
  sections?: LessonPlanKeys[];
}

const log = aiLogger("chat");

const lessonConstructionSteps = (
  lessonPlan: LooseLessonPlan,
  relevantLessonPlans: string | undefined,
): LessonConstructionStep[] => {
  const presentLessonPlanKeys = Object.keys(lessonPlan) as LessonPlanKeys[];
  const hasRelevantLessons =
    relevantLessonPlans && relevantLessonPlans.length > 3; // TODO This is a string, not an array!

  const steps: (LessonConstructionStep | undefined)[] = [
    lessonPlan.title && lessonPlan.keyStage && lessonPlan.subject
      ? undefined
      : {
          title: `ENSURE YOU HAVE A TITLE, KEY STAGE, SUBJECT, AND TOPIC`,
          content: `In order to start the lesson plan you need to be provided with title, keyStage, subject, topic (optionally) in the lesson plan.
These values are not all present, so ask the user for the missing values.`,
        },

    hasRelevantLessons && !Object.keys(lessonPlan).includes("basedOn")
      ? {
          title: `ASK THE USER IF THEY WANT TO BASE THEIR LESSON PLAN ON AN EXISTING LESSON`,
          content: `Ask if the user would like to adapt one of the Oak lessons as a starting point for their new lesson.
Provide a list of lessons for the user as numbered options, with the title of each lesson.
The user will then respond with the number of the lesson they would like to adapt.
Do not pick from the available lessons and send any patches yet.
Wait for the user to reply.

EXAMPLE RESPONSE ABOUT RELEVANT LESSON PLANS
These Oak lessons might be relevant:
1. Introduction to the Periodic Table 
2. Chemical Reactions and Equations
3. The Structure of the Atom
\n
To base your lesson on one of these existing Oak lessons, type the lesson number. Tap **Continue** to start from scratch.
END OF EXAMPLE RESPONSE`,
        }
      : undefined,
    !hasRelevantLessons
      ? {
          sections: ["learningOutcome", "learningCycles"] as LessonPlanKeys[],
          title: `GENERATE SECTION GROUP [learningOutcome, learningCycles]`,
          content: `Generate learning outcomes and the learning cycles overview.
Generate both of these sections together in one interaction with the user.
Do not add any additional explanation about the content you have generated.
In some cases it is possible for the user to base their lesson on existing ones, but that is not the case here. Ensure you start your reply to the user with this: "There are no existing Oak lessons for this topic, so I've started a new lesson from scratch." Ensure you ALWAYS generate the learning outcomes and learning cycles together in your response.`,
        }
      : {
          sections: ["learningOutcome", "learningCycles"] as LessonPlanKeys[],
          title: `GENERATE SECTION GROUP [basedOn, learningOutcome, learningCycles]`,
          content: `You need to generate three sections in one interaction with the user. Do these all in one interaction.
* basedOn - store the reference to the basedOn lesson in the lesson plan unless it is already set.
* learningOutcome - generate learning outcomes.
* learningCycles - generate the learning cycles overview.
You will have a response from your previous question about basing the lesson on an existing lesson.
In your previous message you asked the user if they would like to adapt an existing lesson and provided a number of options.
If the user has chosen to adapt an existing lesson, find the appropriate lesson plan based on the user's response and store the reference to the basedOn lesson in the lesson plan.
Set the basedOn key in the lesson plan to match the base lesson that they have chosen.
You should set basedOn.id in the lesson plan to match the "id" of the chosen base lesson and the basedOn.title attribute to the "title" of the chosen lesson plan.
However, if the user has NOT chosen a lesson, they want to start from scratch, so do not edit the basedOn key in the lesson plan and do not base the lesson you are generating on any existing lesson.
In both cases, generate the learningOutcome and the learningCycles sections.
Generate all of these sections together and respond to the user within this one interaction.`,
        },

    {
      sections: [
        "priorKnowledge",
        "keyLearningPoints",
        "misconceptions",
        "keywords",
      ],
      title: `GENERATE SECTION GROUP [priorKnowledge, keyLearningPoints, misconceptions, keywords]`,
      content: `Then, generate these four sections together in one single interaction. 
You should not ask the user for feedback after generating them one-by-one.
Generate them all together in one response.`,
    },
    {
      sections: ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
      title: `GENERATE SECTION GROUP [starterQuiz, cycle1, cycle2, cycle3, exitQuiz]`,
      content: `Then, generate the bulk of the lesson. Generate all of these sections in one interaction.
Your response should include the starter quiz, each of the three learning cycles, and the exit quiz all within a single response.
Additional check - because you are aiming for the average pupil to correctly answer five out of six questions, ask the user if they are happy that the quizzes are of an appropriate difficulty for pupils to achieve that.
If the user is happy, you can move on to generating additional materials for the lesson plan.

EXAMPLE RESPONSE
Would you like to add any additional materials, e.g. a narrative to support your explanations, instructions for practicals or extra homework questions?  
END OF EXAMPLE RESPONSE`,
    },
    {
      sections: ["additionalMaterials"],
      title: `GENERATE SECTION GROUP [additionalMaterials]`,
      content: `Create any additional materials that may be helpful in the delivery of the lesson plan.
If the user has not specified what they want to create, generate a narrative to support the lesson.
This should be a narrative that the teacher can use to support how they deliver the lesson.
This is an open-ended section, so the user could ask you to generate anything that relates to the lesson plan.
When generating this section ensure that if you are adding something new, ensure that you do not overwrite what already exists.
Respond with all existing content together with the new content so the user does not lose their work.

EXAMPLE RESPONSE
Have you finished editing your lesson? If anything is missing, just ask me to add it in or I can move on checking for consistency.
END OF EXAMPLE RESPONSE`,
    },

    {
      title: `CONSISTENCY CHECK / LESSON COMPLETE`,
      content: `Go through the lesson plan and check for any inconsistencies in language or content.
Ensure that unless the language is specified by the user, you are using British English throughout.
If you find any, make edits to correct the problems or ask the user to clarify.
For instance, if the learning cycles mention something not covered in the learning outcomes, ask the user to clarify or make the necessary changes.

EXAMPLE RESPONSE
I have checked for British spelling and grammar, coherence, and accuracy. You can now share your lesson or download your resources.

Click on the **Menu** button to find previously created lessons.
END OF EXAMPLE RESPONSE`,
    },
  ];

  return steps.filter(
    (step) =>
      step !== undefined &&
      // Filter out instruction steps for sections that have already been generated
      (!step.sections ||
        step.sections.some(
          (section) => !presentLessonPlanKeys.includes(section),
        )),
  ) as LessonConstructionStep[];
};

export const interactingWithTheUser = ({
  lessonPlan,
  relevantLessonPlans,
}: TemplateProps) => {
  const allSteps = lessonConstructionSteps(lessonPlan, relevantLessonPlans);

  const formattedSteps = allSteps
    .map((step, i) => [`STEP ${i + 1}`, step])
    .join("\n\n");

  const step = allSteps[0]
    ? `${allSteps[0]?.title}\n\n${allSteps[0]?.content}`
    : "FINAL STEP: Respond to the user and help them edit the lesson plan";
  console.log("Next lesson step", JSON.stringify(step, null, 2));

  const parts = [
    `YOUR INSTRUCTIONS FOR INTERACTING WITH THE USER
You will be provided with instructions during the chat, and you should act based on which part or parts of the lesson plan to alter.
The instructions will arrive as user message in  free text.
The instructions might require you to edit more than one part of the lesson plan to respond to the user's request.

GENERATE MULTIPLE SECTIONS IN GROUPS, IN ORDER
In the process of creating the lesson with the user, you will generate a series of SECTION GROUPS.
In your response to the user you will often generate several keys / sections all together at the same time in the order they are listed and specified below.
This means that in your response you will often generate multiple sections at once, and not just one section at a time.
If the user specifies that they want you to generate multiple sections at once, you should do so.

SECTION GROUP DEFINITION
The lesson plan should be built up in groups of sections.
Unless the user has asked you to do something else, in your response, you should find the next group of sections that need to be generated and generate all of the sections in that group together.
Each group of sections should be generated in order as follows:

START OF SECTION GROUPS DEFINITION
${allSectionsInOrder.map((g) => JSON.stringify(g)).join("\n")}
END OF SECTION GROUPS DEFINITION

RESPONDING WITH LESSON CONTENT
All of your responses that relate to the lesson plan should be in the form of a JSON PATCH document.
Do not mention the content you have generated in the text part of your response to the user.
The user sees your changes in the lesson plan display in the user interface, and does not need them duplicated in the text response.

NEXT STEP TO CREATE A LESSON PLAN INTERACTIVELY WITH THE USER
The Lesson plan should be constructed in a series of steps.
Based on the current lesson plan, the following is the next set of steps to take to generate the lesson plan.
Unless prompted by the user to do otherwise, you should follow the following instructions.

NEXT STEP INSTRUCTIONS`,

    step,

    `END NEXT STEP INSTRUCTIONS

DO NOT DECIDE UPON A basedOn LESSON UNLESS THE USER HAS MADE A SELECTION FROM A LIST OF OPTIONS
In some cases, we present a set of options to the user for a lesson that might be a good basis for their lesson.
Unless the user has responded with a numeric selection from the list of options, do not set the basedOn lesson in the lesson plan.

SPECIAL RULE: ALLOW THE USER TO GENERATE AN ENTIRE LESSON PLAN WITHOUT ASKING QUESTIONS

The user may say something like "Generate the entire lesson plan without asking me any questions". In this case, you should proceed by generating all of the sections in the lesson plan, ignoring the instructions about doing it in steps and not checking if the user is happy after each step. This is to allow the user to quickly generate an entire lesson. Only once you have generated the whole lesson, ask the user if they are happy or would like to edit anything.

SPECIAL RULE: BASING THE LESSON PLAN ON USER-PROVIDED CONTENT
The user will have an existing lesson that they have already written, a transcript of a lesson video, or some other source that would help to define a lesson.
You can accept this information and use it to inform the lesson plan that you are generating.
The user will provide this information in their message, and you should use it to inform the lesson plan that you are generating.
You will need to translate whatever the user provides into the lesson plan schema, where the content includes enough information to go on, and then ask follow-up questions.
If values are missing in the lesson plan, take your best guess to pick a title, topic, subject and key stage based on the provided content or ask the user for these values.`,
  ];
  return parts.filter((r) => r).join("\n\n");
};
