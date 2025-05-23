import { addReader } from "./gSuite/drive/addReader";
import { googleDrive } from "./gSuite/drive/client";
import { copyTemplate } from "./gSuite/drive/copyTemplate";
import { getLink } from "./gSuite/drive/getLink";
import type { OutputData, Result, State } from "./types";

export const exportGeneric = async <InputData, TemplateData>({
  newFileName,
  data: inputData,
  prepData,
  templateId,
  updateTemplate,
  populateTemplate,
  userEmail,
  onStateChange,
  folderId = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID,
}: {
  newFileName: string;
  data: InputData;
  prepData: (data: InputData) => Promise<TemplateData>;
  templateId: string;
  updateTemplate?: (arg: { templateCopyId: string }) => Promise<void>;
  populateTemplate: (arg: {
    data: TemplateData;
    templateCopyId: string;
  }) => Promise<Result<{ missingData: string[] }>>;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  folderId?: string;
}): Promise<Result<OutputData>> => {
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_OUTPUT_FOLDER_ID is not set");
  }
  try {
    let userCanViewGdriveFile = false;
    onStateChange({ status: "loading", message: "Copying template..." });
    const copyResult = await copyTemplate({
      drive: googleDrive,
      templateId,
      newFileName,
      folderId,
    });
    if ("error" in copyResult) {
      onStateChange({ status: "error", error: copyResult.error });
      return { ...copyResult };
    }

    const { fileCopyId } = copyResult.data;

    onStateChange({
      status: "loading",
      message: "Converting document to template data...",
    });

    const templateData = await prepData(inputData);

    if (updateTemplate) {
      onStateChange({ status: "loading", message: "Updating template" });
      await updateTemplate({ templateCopyId: fileCopyId });
    }

    onStateChange({ status: "loading", message: "Populating doc" });
    const populateResult = await populateTemplate({
      templateCopyId: fileCopyId,
      data: templateData,
    });
    if ("error" in populateResult) {
      onStateChange({ status: "error", error: populateResult.error });
      return { ...populateResult };
    }

    onStateChange({ status: "loading", message: "Adding reader" });
    const addResult = await addReader({
      drive: googleDrive,
      fileId: fileCopyId,
      email: userEmail,
    });
    if ("error" in addResult) {
      /**
       * If the user doesn't have a Google Account, they won't be able to view the source document,
       * but they will still be able to download the exported document via our proxy.
       */
    } else {
      userCanViewGdriveFile = true;
    }

    onStateChange({ status: "loading", message: "Getting link" });
    const linkResult = await getLink({
      drive: googleDrive,
      fileId: fileCopyId,
    });
    if ("error" in linkResult) {
      onStateChange({ status: "error", error: linkResult.error });
      return { ...linkResult };
    }

    const data = {
      fileUrl: linkResult.data.link,
      fileId: fileCopyId,
      templateId,
      userCanViewGdriveFile,
    };

    onStateChange({ status: "success", data });
    return { data };
  } catch (error) {
    onStateChange({ status: "error", error });
    return { error, message: "Failed to export Quiz doc" };
  }
};
