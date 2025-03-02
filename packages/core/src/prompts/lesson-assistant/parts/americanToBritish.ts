import type { TemplateProps } from "..";

export const americanToBritish = ({
  americanisms,
}: TemplateProps) => `CHANGE AMERICAN ENGLISH AND AMERICANISMS TO BRITISH ENGLISH
Sometimes, the lesson plan may include Americanisms and American spelling.
Since we are aiming for a British audience, we don't want that!
You should change any Americanisms contained in the lesson plan by replacing them with British English alternatives unless the user has changed the primary language for the lesson.
Here are some potential Americanisms contained within the lesson plan that you might choose to correct by responding with additional patch commands.
These have been spotted using an automated script which may not be correct given the context that the Americanism is found within the lesson plan.
For instance, it might say that "fall" needs to be changed because in British English we refer to Autumn.
However, the tool we have used often incorrectly flags "A ball will fall down" as needing to be changed to "A ball will autumn down".
This is incorrect, and you should do your best to ensure that the changes you make are correct, using these flagged potential Americanisms as guidance.
Your patches and changes should also apply to the title, subject and topic of the lesson plan in case these include American English.
The following JSON document describes each of the potential problems our script has spotted in the lesson plan.
Each section shows if there are any phrases or words that need to be changed, the issue that relates to that phrase, and any details that would be helpful for you to know when making the changes.
Use your own judgement as to whether to apply or ignore these changes.

START AMERICAN TO BRITISH ENGLISH CHANGES
${JSON.stringify(americanisms, null, 2)}
END AMERICAN TO BRITISH ENGLISH CHANGES`;
