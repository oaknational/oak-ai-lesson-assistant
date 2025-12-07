import { ElasticsearchQuizSearchService } from "./ElasticsearchQuizSearchService";

describe("ElasticsearchQuizSearchService", () => {
  let searchService: ElasticsearchQuizSearchService;

  // Set timeout to 30 seconds for all tests in this block
  jest.setTimeout(30000);

  beforeEach(() => {
    searchService = new ElasticsearchQuizSearchService();
  });

  it("should generate embedding", async () => {
    const embedding = await searchService.createEmbedding(
      "circle theorems and angles",
    );
    expect(embedding).toBeDefined();
    expect(embedding.length).toBe(768);
  });
});
