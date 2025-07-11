import { handleSetPageData } from "../handleSetPageData";

describe("handleSetPageData", () => {
  it("sets page data and logs info", () => {
    const set = jest.fn();
    const get = jest.fn();
    // Use a valid PageData shape
    const pageData = {
      lessonPlan: { lessonId: "id1", title: "t", subject: "s", keyStage: "ks" },
    };
    const handler = handleSetPageData(set, get);
    handler(pageData);
    expect(set).toHaveBeenCalledWith({ pageData });
  });
});
