import { createOpenAIClient } from "../../../llm/openai";

const openai = createOpenAIClient({ app: "image-alt-text" });

const prompt = `You are a content creator and an accessibility specialist for visually impaired users. You must write a clear and accurate ALT text for this image. You should accurately describe the image foreground and background, the colours and any objects in the image. Write out any text if it is present, and describe any people, their clothes, and their expressions if they are present. The literacy level of the text should be understandable to a 6-year-old pupil and written with exceptional spelling, punctuation and grammar in British English, think about the language that is understandable to this age group. Do not exceed 300 characters. If you believe you can accurately complete the task in less than 300 characters than do so. `;

const promptInQuizMode = `You are a content creator and an accessibility specialist for visually impaired users. 

You must write a clear and accurate ALT text for this image.

This image is an option in a multiple choice question. 

You should accurately describe the image without letting the user know exactly what is in the image and letting them know the answer.

The literacy level of the text should be understandable to a 6-year-old pupil and written with exceptional spelling, punctuation and grammar in British English, think about the language that is understandable to this age group. Do not exceed 300 characters. If you believe you can accurately complete the task in less than 300 characters than do so. `;

export async function requestImageDescription(
  url: string | undefined,
  currentAlt?: string | null,
  inQuizMode?: boolean,
) {
  try {
    log("Requesting image description...");

    // Assuming you have a loading state variable to manage the loading state
    // Set loading state to true"openai": "^4.24.1",
    log("Loading");

    const promptInUse = inQuizMode ? promptInQuizMode : prompt;

    const constructedPrompt = currentAlt
      ? `${promptInUse} You must improve on the previous description  ${currentAlt}`
      : promptInUse;

    if (typeof url === "string") {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                // text: "Use 80 characters or less to describe what is in this image?",
                text: constructedPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: url,
                  detail: "high",
                },
              },
            ],
          },
        ],
      });

      log("Image description received:", response);
      log("Image description received:", response.choices[0]);

      return response.choices[0]?.message.content;
    }
  } catch (error) {
    console.error("Error requesting image description:", error);
  }
}
