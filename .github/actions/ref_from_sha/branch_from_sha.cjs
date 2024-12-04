/**
 * Given repo info and a sha, get first branch that sha is the current head of (prefer `main`), or null.
 *
 * @param {Object} octokit a pre-authed instance of Octokit
 * @param {Object} repoInfo repo information
 * @param {string} sha commit sha
 *
 * @returns {Object|null} The matched branch, or null.
 */
async function branchFromSha(octokit, repoInfo, sha) {
  // https://octokit.github.io/rest.js/v18
  const { data: branches } = await octokit.rest.repos.listBranchesForHeadCommit(
    {
      ...repoInfo,
      commit_sha: sha,
    },
  );

  // No matching branches.
  if (!branches || branches.length === 0) {
    return null;
  }

  const main = branches.find((branch) => branch.name === "main");
  if (main) {
    // It's the HEAD SHA of the main branch.
    return main;
  } else {
    // It's the HEAD SHA of _a_ branch, we don't know which one we care about, return the first one.
    // This should rarely happen (maybe a CI run on a branch that ins't in a PR), and then the chance
    // of there being two branches with the same HEAD are very low.
    return branches[0];
  }
}

module.exports = branchFromSha;
