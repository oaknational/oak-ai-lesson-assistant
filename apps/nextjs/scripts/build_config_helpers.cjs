// @ts-check
const { existsSync, readFileSync } = require("fs");

/**
 * Attempt to read the SHA of the current Git HEAD from the local file system.
 *
 * @returns {(string|null)} The SHA if found, or "no_git_state" if mid-merge, or `null` if it cannot be determined.
 */
function getLocalGitRef() {
  if (existsSync("../../.git")) {
    const rev = readFileSync("../../../.git/HEAD")
      .toString()
      .trim()
      .split(/.*[: ]/)
      .slice(-1)[0];
    if (rev?.indexOf("/") === -1) {
      return rev;
    } else {
      try {
        return readFileSync(`../../.git/${rev}`).toString().trim();
      } catch (error) {
        console.log("e", error);
        // Likely mid-merge
        return "no_git_state";
      }
    }
  }
  console.warn("Could not determine local Git ref.");
  return null;
}
/**
 * Figure out the Git ref for non-production builds.
 *
 * Tries common env variables first, then falls back
 * to the local file system .git folder.
 *
 * @returns {(string|null)} A git ref, usually a commit SHA, potentially a tag name.
 */
function getGitRef() {
  const gitRef =
    // Vercel
    process.env.VERCEL_GIT_COMMIT_SHA ||
    // Github Workflow
    process.env.GITHUB_SHA ||
    // GCP Build
    process.env.GCP_COMMIT_SHA ||
    process.env.GCP_TAG_NAME ||
    // Override
    process.env.GIT_SHA_OVERRIDE;

  if (gitRef) {
    return gitRef;
  } else {
    // Fall back to local Git folder.
    return getLocalGitRef();
  }
}

/**
 * Determine an app version.
 *
 * For production builds parse the version from the Git ref triggering the build.
 * For all other builds use the current Git HEAD SHA.
 *
 * @returns {string} An app version identifier.
 * @throws {Error} Throws if a Git ref cannot be determined for a non-production build.
 */
function getAppVersion({ isProductionBuild }) {
  if (!isProductionBuild) {
    const gitRef = getGitRef();
    if (!gitRef) {
      throw new Error("Could not determine a Git ref for this build.");
    }
    return gitRef;
  }

  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;

  if (!commitMessage) {
    throw new Error("Missing Vercel commit message");
  }

  // Release commit format defined in release.config.js
  const releaseCommitFormat = /build\(release [vV]\d+\.\d+\.\d+\):/;
  const isReleaseCommit = releaseCommitFormat.test(commitMessage);

  if (!isReleaseCommit) {
    // Couldn't figure out production version number, bail.
    throw new TypeError("Could not determine production version number.");
  }

  const matches = commitMessage.match(/([vV]\d+\.\d+\.\d+)/);
  if (matches === null) {
    throw new TypeError(
      "Could not extract app version from commit info message",
    );
  }
  let version = matches[0];

  return version;
}

const RELEASE_STAGE_TESTING = "test";
const RELEASE_STAGE_DEVELOPMENT = "development";
const RELEASE_STAGE_DEVELOPMENT_NETLIFY = "dev";
const RELEASE_STAGE_BRANCH_DEPLOY_NETLIFY = "branch-deploy";
const RELEASE_STAGE_PREVIEW = "preview";
const RELEASE_STAGE_PREVIEW_NETLIFY = "deploy-preview";
const RELEASE_STAGE_PRODUCTION = "production";
const RELEASE_STAGE_NOT_DEFINED = "NOT_DEFINED";
/**
 * Given a proposed release stage name, return one of the standard release stage names.
 *
 * "development", "preview" or "production".
 * Release stage is elective, so it's different from NODE_ENV and the Webpack `dev` flag.
 *
 * @param {string} candidateReleaseStage the proposed release stage name.
 * @returns {string} The canonical release stage name.
 */
function getReleaseStage(candidateReleaseStage = RELEASE_STAGE_NOT_DEFINED) {
  switch (candidateReleaseStage) {
    case RELEASE_STAGE_DEVELOPMENT:
    case RELEASE_STAGE_DEVELOPMENT_NETLIFY:
    case RELEASE_STAGE_BRANCH_DEPLOY_NETLIFY:
      return RELEASE_STAGE_DEVELOPMENT;
    case RELEASE_STAGE_PREVIEW:
    case RELEASE_STAGE_PREVIEW_NETLIFY:
      return RELEASE_STAGE_PREVIEW;
    case RELEASE_STAGE_PRODUCTION:
      return RELEASE_STAGE_PRODUCTION;
    case RELEASE_STAGE_NOT_DEFINED:
      console.log('No release stage defined, falling back to "development"');
      return RELEASE_STAGE_DEVELOPMENT;
    default:
      throw new TypeError(`
      Unsupported release stage: "${candidateReleaseStage}".
      Available stages are: ${RELEASE_STAGE_DEVELOPMENT}, ${RELEASE_STAGE_PREVIEW} and ${RELEASE_STAGE_PRODUCTION}.
      `);
  }
}

module.exports = {
  RELEASE_STAGE_DEVELOPMENT,
  RELEASE_STAGE_PREVIEW,
  RELEASE_STAGE_PRODUCTION,
  RELEASE_STAGE_TESTING,
  getAppVersion,
  getReleaseStage,
};
