module.exports = {
  branches: ["release"],
  plugins: [
    // Analyse commits.
    // https://github.com/semantic-release/commit-analyzer/#rules-definition
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "chore", release: "patch" },
          { type: "refactor", release: "patch" },
        ],
      },
    ],
    // Create release notes.
    "@semantic-release/release-notes-generator",

    // Add the release notes to a change log.
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGE_LOG.md",
      },
    ],
    // Commit the change log.
    [
      "@semantic-release/git",
      {
        assets: ["CHANGE_LOG.md"],
        // Note, this isn't a string literal, it's a Mustache-style template.
        message: "build(release v${nextRelease.version}): See CHANGE_LOG.md",
      },
    ],

    // Generate the Github release.
    // https://github.com/semantic-release/github
    "@semantic-release/github",
  ],
};
