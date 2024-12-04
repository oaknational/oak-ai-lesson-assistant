const github = require("@actions/github");

const prFromSha = require("../pr_from_sha.cjs");
const branchFromSha = require("../branch_from_sha.cjs");

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  throw new Error("Need Github token");
}
const octokit = github.getOctokit(githubToken);

const owner = github.context.payload.repository.owner.login;
const repo = github.context.payload.repository.name;
if (!owner || !repo) {
  throw new Error(
    `Could not determine repo details, got: owner "${owner} and repo "${repo}".`,
  );
}

const repoInfo = {
  owner,
  repo,
};

// PR test
// Set this to the head commit on a branch in a PR, short SHAs are fine.
const prSha = "c6458f3";
prFromSha(octokit, repoInfo, prSha).then((pr) => {
  if (pr === null) {
    console.log("no pr found");
  } else {
    console.log(pr.head.ref);
  }
});

// branch test
const branchPr = "5c34737740d989b05d021769871dd1a365ded88d";
branchFromSha(octokit, repoInfo, branchPr).then((branch) => {
  if (branch === null) {
    console.log("no branch found");
  } else {
    console.log(branch);
  }
});
