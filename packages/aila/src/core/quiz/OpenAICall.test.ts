import { OpenAICallReranker } from "./OpenAIRanker";

// describe("Test OpenAI Image Chat", () => {
//   it("Should return a valid response", async () => {
//     const chatId = "test-chat-id";
//     const userId = "test-user-id";

//     const openAIProvider = createVercelOpenAIClient({
//       chatMeta: { userId, chatId },
//       app: "lesson-assistant",
//     });

//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: "What are in these images? Is there any difference between them?",
//             },
//             {
//               type: "image_url",
//               image_url: {
//                 url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
//               },
//             },
//             {
//               type: "image_url",
//               image_url: {
//                 url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
//               },
//             },
//           ],
//         },
//       ],
//     });
//     console.log(response.choices[0]);
//     const ans = true;
//     expect(ans).toBe(true);
//   });
// });

// describe("Test OpenAI Image Chat", () => {
//   it("Should return a valid response", async () => {
//     const chatId = "test-chat-id";
//     const userId = "test-user-id";

//     const response = DummyOpenAICall();
//     const ans = true;
//     expect(ans).toBe(true);
//   });
// });

// This is here for the purpose of having method of timing / testing other parts of OpenAI Image rating outside of the large reranker set up.
describe("Test OpenAI Image Chat", () => {
  jest.setTimeout(60000);
  it("Should return a valid response", async () => {
    const chatId = "test-chat-id";
    const userId = "test-user-id";
    const Messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What are in these images? Is there any difference between them?",
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              detail: "high",
            },
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              detail: "high",
            },
          },
        ],
      },
    ];
    const response = await OpenAICallReranker(Messages);
    expect(response).toBeDefined();
  });
});
