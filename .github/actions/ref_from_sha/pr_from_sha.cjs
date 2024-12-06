/**
 * Given repo info and a sha, get the pull request that sha is the current head of, or null.
 *
 * @param {Object} octokit a pre-authed instance of Octokit
 * @param {Object} repoInfo repo information
 * @param {string} sha commit sha
 *
 * @returns {Object|null} The matched PR, or null.
 */
async function prFromSha(octokit, repoInfo, sha) {
  // https://octokit.github.io/rest.js/v18
  // https://docs.github.com/en/rest/reference/pulls#list-pull-requests
  const { data: pullRequests } = await octokit.rest.pulls.list({
    sort: "updated",
    direction: "desc",
    ...repoInfo,
  });

  return (
    pullRequests.find((pr) => {
      const prHeadSha = pr.head.sha;
      if (typeof prHeadSha !== "string") {
        return false;
      }
      return prHeadSha.startsWith(sha);
    }) || null
  );
}

module.exports = prFromSha;
