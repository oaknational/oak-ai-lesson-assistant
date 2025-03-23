import { execSync } from "child_process";

const getCurrentBranch = () => {
  return execSync("git branch --show-current").toString().trim();
};

const getPrNumber = (branch: string) => {
  const output = execSync(
    `gh pr list --head ${branch} --json number`,
  ).toString();
  const pr = JSON.parse(output)[0];
  return pr?.number;
};

const getPrComments = (prNumber: number) => {
  // Get all reviews
  const reviews = JSON.parse(
    execSync(
      `gh api /repos/oaknational/oak-ai-lesson-assistant/pulls/${prNumber}/reviews`,
    ).toString(),
  );

  // Get comments for each review
  const comments = reviews
    .map((review: any) => {
      if (review.user.login === "codeincontext") {
        const reviewComments = JSON.parse(
          execSync(
            `gh api /repos/oaknational/oak-ai-lesson-assistant/pulls/${prNumber}/reviews/${review.id}/comments`,
          ).toString(),
        );

        return reviewComments.map((comment: any) => ({
          file: comment.path,
          line: comment.position,
          body: comment.body,
          url: comment.html_url,
        }));
      }
      return [];
    })
    .flat();

  return comments;
};

const main = () => {
  try {
    const branch = getCurrentBranch();
    const prNumber = getPrNumber(branch);

    if (!prNumber) {
      console.error("No PR found for current branch");
      process.exit(1);
    }

    const comments = getPrComments(prNumber);

    if (comments.length === 0) {
      console.log("No comments found from codeincontext");
      return;
    }

    console.log("\nComments from codeincontext:");
    console.log("============================\n");

    comments.forEach((comment) => {
      console.log(`File: ${comment.file}`);
      console.log(`Line: ${comment.line}`);
      console.log(`Comment: ${comment.body}`);
      console.log(`URL: ${comment.url}`);
      console.log("-------------------\n");
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
