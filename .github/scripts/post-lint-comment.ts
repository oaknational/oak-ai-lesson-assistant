import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";

/**
 * Finds an existing bot comment with the specified content
 */
async function findExistingComment(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context,
): Promise<{ id: number } | undefined> {
  const { data: comments } = await octokit.rest.issues.listComments({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  return comments.find(
    (comment) =>
      comment?.user?.type === "Bot" &&
      comment?.body?.includes("ESLint Diff Results"),
  );
}

/**
 * Posts or updates a PR comment with the lint results
 */
async function postLintComment(reportPath: string): Promise<void> {
  try {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report file not found: ${reportPath}`);
    }

    const commentBody = fs.readFileSync(reportPath, "utf8");
    const token = core.getInput("github-token");
    const octokit = github.getOctokit(token);
    const context = github.context;

    const botComment = await findExistingComment(octokit, context);

    if (botComment) {
      await octokit.rest.issues.updateComment({
        comment_id: botComment.id,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: commentBody,
      });
      console.log("Updated existing PR comment");
    } else {
      await octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: commentBody,
      });
      console.log("Created new PR comment");
    }
  } catch (error) {
    console.error("Error posting PR comment:", error);
    core.setFailed(`Failed to post PR comment: ${error}`);
  }
}

// When run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: ts-node post-lint-comment.ts <report-file>");
    process.exit(1);
  }

  const reportPath = args[0];

  postLintComment(reportPath).catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { postLintComment };
