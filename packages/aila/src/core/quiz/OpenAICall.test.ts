import { OpenAICallReranker } from "./OpenAIRanker";

// This is here for the purpose of having method of timing / testing other parts of OpenAI Image rating outside of the large reranker set up.
describe("Test OpenAI Image Chat", () => {
  jest.setTimeout(60000);
  it("Should return a valid response", async () => {
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
