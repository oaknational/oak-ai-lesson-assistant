import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import type { NextRequest } from "next/server";

async function updateExpiredAt(fileIds: string[]) {
  if (fileIds.length === 0) {
    console.log("No file IDs to update.");
    return;
  }

  try {
    const result = await prisma.lessonExport.updateMany({
      where: {
        gdriveFileId: {
          in: fileIds,
        },
      },
      data: {
        expiredAt: new Date(),
      },
    });
    console.log(`Updated expiredAt for ${fileIds.length} files.`);

    if (result.count === fileIds.length) {
      console.log("All files updated successfully.");
    } else {
      throw new Error(
        `Expected to update ${fileIds.length} files, but only updated ${result.count}.`,
      );
    }
  } catch (error) {
    console.error("Error updating expiredAt field in the database:", error);
    throw error;
  }
}

async function deleteExpiredExports(fileIds: string[]) {
  try {
    for (const id of fileIds) {
      googleDrive.files.delete({ fileId: id });
      console.log("Deleted:", id);
    }
  } catch (error) {
    console.error("Error deleting old files from folder:", error);
    throw error;
  }
}

async function fetchExpiredExports(folderId: string) {
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

    const files = res.data.files || [];

    console.log("Files:", files);

    if (files.length === 0) {
      console.log(
        "No files found that are older than one month in the specified folder.",
      );
      return null;
    }

    console.log(`Found ${files.length} files older than one month in folder:`);
    return files;
  } catch (error) {
    console.error("Error fetching old files from folder:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  //   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //     console.log("Authorization failed. Invalid token.");
  //     return new Response("Unauthorized", { status: 401 });
  //   }

  const files = await fetchExpiredExports("1r6BM2h6TQU6GgS3vmTA6_1I_6yg0faEG");

  if (!files || files.length === 0) {
    return new Response("No expired files found", { status: 404 });
  }
  const validFileIds = files
    .map((file) => file.id)
    .filter((id): id is string => Boolean(id));

  await updateExpiredAt(validFileIds);
  await deleteExpiredExports(validFileIds);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
