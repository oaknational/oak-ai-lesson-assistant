import { googleDrive } from "./client";

async function deleteOldFilesInFolder(folderId: string) {
  try {
    const currentDate = new Date();
    const oneMonthAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 30),
    ).toISOString();

    const query = `modifiedTime < '${oneMonthAgo}' and '${folderId}' in parents`;

    const res = await googleDrive.files.list({
      q: query,
      fields: "files(id, name, modifiedTime)",
    });

    const files = res.data.files;

    if (!files || files.length === 0) {
      console.log(
        "No files found that are older than one month in the specified folder.",
      );
      return;
    }

    console.log(`Found ${files.length} files older than one month in folder:`);

    for (const file of files) {
      console.log(
        `Deleting file: ${file.name} (Modified on: ${file.modifiedTime})`,
      );
      //   await drive.files.delete({ fileId: file.id });
      console.log(`Deleted: ${file.name}`);
    }

    console.log("All old files deleted successfully from the folder.");
  } catch (error) {
    console.error("Error deleting old files from folder:", error);
  }
}

const folderId = "1ivRtJk6nnetQA8_70NAtzbZodem_9XL-";
deleteOldFilesInFolder(folderId);
