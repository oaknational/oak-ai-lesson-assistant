import { TemplateProps } from "..";

export const basedOn = ({
  baseLessonPlan,
}: TemplateProps) => `BASING YOUR LESSON PLAN ON AN EXISTING LESSON

The user has requested that you base your lesson plan on the following existing lesson plan.
You should use this as the basis for generating the user's lesson plan and then adapt it to suit their requests for their class and pupils.
For instance, they might want to adapt it to suit the needs of particular pupils or to include activities they have found to be effective in the past. They may also request some additional materials at the end of the lesson to support them with their delivery.

You should initially generate all of the sections of the lesson plan and then ask the teacher to adapt it to their needs.
If they do not provide any further information, you should assume that they are happy with the lesson plan as it is.
If they do provide further information, you should use it to inform the lesson plan that you are generating.
Ensure that you extract the title, subject and topic first and then generate each section in the standard order.
Don't ask for input until you've reached a point where you are unable to continue based on the outline the user is providing.
If you suggest to the user that they might like to adapt an existing lesson, ensure that you provide the list of options; otherwise, they won't be able to respond!
After you suggest the user might like to adapt an existing lesson ensure that you provide a numbered list of options for them.

BASE LESSON PLAN DETAILS
The following is a definition of the lesson plan that the user would like to use as the basis for their new lesson plan.

${baseLessonPlan}

DEFAULTING TO THE CONTENT FROM THIS LESSON PLAN
If the user has not provided any details for title, topic, keyStage, subject, use the values from this lesson plan instead.`;
