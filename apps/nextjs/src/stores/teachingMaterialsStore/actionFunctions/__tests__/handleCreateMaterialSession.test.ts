import { teachingMaterialTypeEnum } from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";

import type { TrpcUtils } from "@/utils/trpc";

import { handleStoreError } from "../../utils/errorHandling";
import { handleCreateMaterialSession } from "../handleCreateMaterialSession";

jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock("../../utils/errorHandling", () => ({ handleStoreError: jest.fn() }));

const mockSet = jest.fn();
const mockRefreshAuth = jest.fn();

describe("handleCreateMaterialSession", () => {
  let mockTrpc: TrpcUtils;
  let mockGet: jest.Mock;
  let mockTrackMaterialSelected: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackMaterialSelected = jest.fn();
    mockTrpc = {
      client: {
        teachingMaterials: {
          createMaterialSession: {
            mutate: jest.fn().mockResolvedValue({ resourceId: "resource-xyz" }),
          },
        },
      },
    } as unknown as TrpcUtils;
    mockGet = jest.fn(() => ({
      id: undefined,
      source: "aila",
      actions: {
        analytics: {
          trackMaterialSelected: mockTrackMaterialSelected,
        },
      },
    }));
  });

  it("calls mutate, sets id, and tracks event when coming from OWA", async () => {
    const handler = handleCreateMaterialSession(
      mockSet,
      mockGet,
      mockTrpc,
      mockRefreshAuth,
    );
    await handler("additional-glossary", 2, true);
    expect(
      mockTrpc.client.teachingMaterials.createMaterialSession
        .mutate as jest.Mock,
    ).toHaveBeenCalledWith({
      documentType: teachingMaterialTypeEnum.parse("additional-glossary"),
    });
    expect(mockSet).toHaveBeenCalledWith({ stepNumber: 2 });
    expect(mockSet).toHaveBeenCalledWith({ id: "resource-xyz" });
    expect(mockTrackMaterialSelected).toHaveBeenCalledWith({
      resourceId: "resource-xyz",
      docType: teachingMaterialTypeEnum.parse("additional-glossary"),
      componentType: "create_more_with_ai_dropdown",
      platform: "owa",
      product: "teacher lesson resources",
    });
  });

  it("calls mutate, sets id, and tracks event for AILA", async () => {
    mockGet = jest.fn(() => ({
      id: undefined,
      source: "aila",
      actions: {
        analytics: {
          trackMaterialSelected: mockTrackMaterialSelected,
        },
      },
    }));
    const handler = handleCreateMaterialSession(
      mockSet,
      mockGet,
      mockTrpc,
      mockRefreshAuth,
    );
    await handler("additional-glossary", 1, false);
    expect(
      mockTrpc.client.teachingMaterials.createMaterialSession
        .mutate as jest.Mock,
    ).toHaveBeenCalledWith({
      documentType: teachingMaterialTypeEnum.parse("additional-glossary"),
    });
    expect(mockSet).toHaveBeenCalledWith({ stepNumber: 1 });
    expect(mockSet).toHaveBeenCalledWith({ id: "resource-xyz" });
    expect(mockTrackMaterialSelected).toHaveBeenCalledWith({
      resourceId: "resource-xyz",
      docType: teachingMaterialTypeEnum.parse("additional-glossary"),
      componentType: "lesson_details_button",
      platform: "aila-beta",
      product: "teaching material",
    });
  });

  it("calls mutate, sets id, and tracks event for additional teaching materials when coming from owa. (They create a new material after the first)", async () => {
    mockGet = jest.fn(() => ({
      id: undefined,
      source: "owa",
      actions: {
        analytics: {
          trackMaterialSelected: mockTrackMaterialSelected,
        },
      },
    }));
    const handler = handleCreateMaterialSession(
      mockSet,
      mockGet,
      mockTrpc,
      mockRefreshAuth,
    );
    await handler("additional-glossary", undefined, false);
    expect(
      mockTrpc.client.teachingMaterials.createMaterialSession
        .mutate as jest.Mock,
    ).toHaveBeenCalledWith({
      documentType: teachingMaterialTypeEnum.parse("additional-glossary"),
    });
    expect(mockSet).toHaveBeenCalledWith({ stepNumber: 1 });
    expect(mockSet).toHaveBeenCalledWith({ id: "resource-xyz" });
    expect(mockTrackMaterialSelected).toHaveBeenCalledWith({
      resourceId: "resource-xyz",
      docType: teachingMaterialTypeEnum.parse("additional-glossary"),
      componentType: "create_teaching_material_button",
      platform: "aila-beta",
      product: "teaching material",
    });
  });

  it("handles error and calls handleStoreError", async () => {
    (
      mockTrpc.client.teachingMaterials.createMaterialSession
        .mutate as jest.Mock
    ).mockRejectedValue(new Error("fail"));
    const handler = handleCreateMaterialSession(
      mockSet,
      mockGet,
      mockTrpc,
      mockRefreshAuth,
    );
    const result = await handler("additional-glossary", 1, false);
    expect(handleStoreError).toHaveBeenCalledWith(
      mockSet,
      expect.any(Error),
      expect.objectContaining({
        context: "handleCreateMaterialSession",
        docType: "additional-glossary",
      }),
    );
    expect(result).toEqual({ success: false });
  });
});
