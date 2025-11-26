import * as Sentry from "@sentry/nextjs";

import { handleSetDocType } from "../handleSetDocType";

describe("handleSetDocType", () => {
  it("sets docType when not null", () => {
    const set = jest.fn();
    const get = jest.fn();
    const handler = handleSetDocType(set, get);
    handler("additional-glossary");
    expect(set).toHaveBeenCalledWith({ docType: "additional-glossary" });
  });

  it("sets docType and id to null when docType is null", () => {
    const set = jest.fn();
    const get = jest.fn();
    const handler = handleSetDocType(set, get);
    handler(null);
    expect(set).toHaveBeenCalledWith({ docType: null, id: null });
  });

  it("reports to Sentry and logs error if docType is invalid", () => {
    const set = jest.fn();
    const get = jest.fn();
    const sentrySpy = jest.spyOn(Sentry, "captureException");
    const invalidDocType = "not-a-real-type";
    const handler = handleSetDocType(set, get);
    handler(invalidDocType);
    expect(set).not.toHaveBeenCalledWith({ docType: invalidDocType });
    expect(sentrySpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: { docType: invalidDocType } }),
    );
    sentrySpy.mockRestore();
  });
});
