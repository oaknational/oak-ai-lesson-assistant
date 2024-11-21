import { CategoriseKeyStageAndSubjectResponse } from "@oakai/core/src/rag/categorisation";
import { keyStages, subjects } from "@oakai/core/src/utils/subjects";
import { aiLogger } from "@oakai/logger";
import type { ChatCompletionMessageParam } from "openai/resources";
import { Md5 } from "ts-md5";

import { DEFAULT_CATEGORISE_MODEL } from "../../../constants";
import type { AilaServices } from "../../../core/AilaServices";
import type { Message } from "../../../core/chat";
import type { OpenAICompletionWithLoggingOptions } from "../../../lib/openai/OpenAICompletionWithLogging";
import { OpenAICompletionWithLogging } from "../../../lib/openai/OpenAICompletionWithLogging";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { AilaCategorisationFeature } from "../../types";

const log = aiLogger("aila:categorisation");

export class AilaCategorisation implements AilaCategorisationFeature {
  private _aila: AilaServices;
  constructor({ aila }: { aila: AilaServices }) {
    this._aila = aila;
  }
  public async categorise(
    messages: Message[],
    lessonPlan: LooseLessonPlan,
  ): Promise<LooseLessonPlan | undefined> {
    const { title, subject, keyStage, topic } = lessonPlan;
    const input = messages.map((i) => i.content).join("\n\n");
    const categorisationInput = [title, subject, keyStage, topic, input]
      .filter((i) => i)
      .join(" ");

    const result = await this.fetchCategorisedInput(categorisationInput);
    return result;
  }

  private async categoriseKeyStageAndSubject(
    input: string,
    chatMeta: OpenAICompletionWithLoggingOptions,
  ) {
    log.info("Categorise input", JSON.stringify(input));
    //# TODO Duplicated for now until we refactor the RAG class
    const systemMessage = `You are a classifier which can help me categorise the intent of the user's input for an application which helps a teacher build a lesson plan their students in a UK school.
You accept a string as input and return an object with the keys keyStage, subject, title and topic.

USER INPUT
The user will likely be starting to make a new lesson plan and this may be their first interaction with the system. So it's likely that the text will include introductory information, such as "Hello, I would like you to make a lesson about {title} for {key stage} students in {subject}." or "I need a lesson plan for {title} for {subject} students in {key stage}." The user may also include a topic for the lesson plan, such as "I need a lesson plan for {title} for {subject} students in {key stage} about {topic}."
The input will be highly variable, so you should be able to handle a wide range of inputs, and extract the relevant information from the input.

KEY STAGE SLUGS
The following are the key stages you can use to categorise the input. Each of these is slug which we use in the database to refer to them:
${keyStages.join("\n")}

SUBJECT SLUGS
The following are the subjects you can use to categorise the input. Each of these is a slug which we use in the database to refer to them:
${subjects.join("\n")}

LESSON TITLES
The title of the lesson plan is the title of the lesson plan that the user wants to create. This could be anything, but it will likely be a short phrase or sentence that describes the topic of the lesson plan.
Do not include "Lesson about" or "…Lesson" in the title. The title should be the standalone main topic of the lesson plan and not mention the word Lesson. It will be used as the title of the lesson plan in our database and displayed to the user in an overview document. The title should be in sentence case.

RETURNED OBJECT
The object you return should have the following shape:
{
  reasoning: string, // Why you have chosen to categorise the input in the way that you have
  keyStage: string, // The slug of the key stage that the input is relevant to
  subject: string, // The slug of the subject that the input is relevant to
  title: string, // The title of the lesson plan
  topic: string // The topic of the lesson plan
}

GUESSING AN APPROPRIATE KEY STAGE, SUBJECT OR TOPIC WHEN NOT SPECIFIED
Where not specified by the user, you should attempt to come up with a reasonable title, key stage, subject and topic based on the input from the user.
For instance, "Plate tectonics" is obviously something covered in Geography and based on your knowledge of the UK education system I'm sure you know that this is often taught in Key Stage 2.
Imagine that you are a teacher who is trying to categorise the input. 
You should use your knowledge of the UK education system to make an educated guess about the key stage and subject that the input is relevant to.

EXAMPLE ALIASES

Often, teachers will use shorthand to refer to a key stage or subject. For example, "KS3" is often used to refer to "Key Stage 3". You should be able to handle these aliases and return the correct slug for the key stage or subject.
The teacher might also say "Year 10". You should be able to handle this and return the correct slug for the key stage based on the teaching years that are part of the Key Stages in the UK National Curriculum.
For subjects, you should also be able to handle the plural form of the subject. For example, "Maths" should be categorised as "maths" and "Mathematics" should be categorised as "maths".
"PSHE" is often used to refer to "Personal, Social, Health and Economic education" and maps to "psed" in our database.
"PE" is often used to refer to "Physical Education". 
"DT" is often used to refer to "Design and Technology".
"RSHE" is often used as a synonym for "PSHE" and "PSED" and maps to "rshe-pshe" in our database.
You should be able to handle any of these aliases and return the correct slug for the subject.
For computing we have both "GCSE" and "non-GCSE". By default, assume that the input is relevant to the GCSE computing curriculum. If the input is relevant to the non-GCSE computing curriculum, the user will specify this in the input.

PROVIDING REASONING
When key stage, subject and topic are not provided by the user, it may be helpful to write out your reasoning for why you think the input relates to a particular key stage, subject or topic. Start with this reasoning in your response and write out why you think that the input is relevant to the key stage, subject and topic that you have chosen. This will help us to understand your thought process and improve the system in the future.

BRITISH ENGLISH
The audience for your categorisation is teachers in the UK, so you should use British English when responding to the user. For example, use "Maths" instead of "Math" and "Key Stage 3" instead of "Grade 3".
If the user has provided a title or topic that is in American English, you should still respond with the British English equivalent. For example, if the user has provided the subject "Math" you should respond with "Maths". Or if the user has provided the title "Globalization" you should respond with "Globalisation".

RESPONDING TO THE USER
All keys are optional but always prefer sending back a keyStage or subject if you are able to take a good guess at what would be appropriate values. If you are *REALLY* not able to determine the key stage or subject, you can return null for these values, but only do so as a last resort! If you are not able to determine the title or topic, you can return null for these values.
Always respond with a valid JSON document. If you are not able to respond for some reason, respond with another valid JSON document with the keys set to null and an "error" key with the value specifying the reason for the error.
Never respond with slugs that are not in the list of slugs provided above. If you are not able to categorise the input, return null for the key stage and subject. This is very important! We use the slugs to categorise the input in our database, so if you return a slug that is not in the list above, we will not be able to categorise the input correctly.
Do not respond with any other output than the object described above. If you do, the system will not be able to understand your response and will not be able to categorise the input correctly.
Thank you and happy classifying!`;

    const promptVersion = Md5.hashStr(systemMessage);
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: input },
    ];

    // #TODO This is the only place where we use this old OpenAICompletionWithLogging
    // We should be using methods on the Aila instance instead
    const { completion } = await OpenAICompletionWithLogging(
      {
        ...chatMeta,
        promptVersion,
        prompt: "categorise_key_stage_and_subject",
      },
      {
        model: DEFAULT_CATEGORISE_MODEL,
        stream: false,
        messages,
        response_format: { type: "json_object" },
      },
    );

    try {
      const content = completion.choices?.[0]?.message.content;
      if (!content) return { error: "No content in response" };

      const parsedResponse = CategoriseKeyStageAndSubjectResponse.parse(
        JSON.parse(content),
      );
      log.info("Categorisation results", parsedResponse);
      return parsedResponse;
    } catch (e) {
      return { error: "Error parsing response" };
    }
  }

  private async fetchCategorisedInput(
    input: string,
  ): Promise<LooseLessonPlan | undefined> {
    const parsedCategorisation = await this.categoriseKeyStageAndSubject(
      input,
      {
        chatId: this._aila.chatId,
        userId: this._aila.userId,
      },
    );
    const { keyStage, subject, title, topic } = parsedCategorisation;
    const plan: LooseLessonPlan = {
      keyStage: keyStage ?? undefined,
      subject: subject ?? undefined,
      title: title ?? undefined,
      topic: topic ?? undefined,
    };
    return plan;
  }
}
