Launch a sub-agent to generate my daily standup message. First gather context from our conversation, then pass it to the sub-agent.

**Context to include:**

- Current work or features we've been discussing
- Any known blockers, issues, or dependencies mentioned
- Branch or ticket work that's been the focus
- People, deadlines, or processes we've talked about
- Any specific work timing or release context

The sub-agent should then:

1. **Determine time range**: If today is Monday, look at Friday's work. Otherwise look at yesterday.

2. **Gather information from multiple sources** (READ-ONLY operations only):

   - Use logseq tools to analyze journal entries from the determined time range
   - Get git user name with `git config user.name`
   - Check recent commit history using `git log --oneline --since="[timeframe]" --author="$(git config user.name)" --no-pager`
   - Check current branch with `git branch --show-current`
   - Check git status with `git status --porcelain`
   - DO NOT use Notion API tools for standup generation
   - DO NOT run any git commands that modify state (checkout, commit, push, etc.)

3. **Extract and categorize**:

   - Work completed (from git commits, journal entries, closed PRs)
   - Blockers and issues (from journal entries, failed builds, review feedback)
   - Today's planned work (from journal entries, open PRs, current branch work)

4. **Return formatted standup with hierarchical structure**:

   ```
   **Yesterday**
   - [Work theme 1 with ticket reference]
     - [Context/insight about the work]
     - [Additional details or outcomes]
   - [Work theme 2]
     - [Details about what was accomplished]
   - [Work theme 3]

   **Today**
   - [Planned work theme 1]
     - [Context about next steps]
     - [Dependencies or timeline notes]
   - [Planned work theme 2]
     - [Specific actions planned]
   - [Other work]

   **Blockers**
   - [Blocker theme if any]
     - [Context about the blocker]
   - None (if no blockers)
   ```

5. Keep it concise and team-focused - avoid deep technical implementation details but include ticket numbers when available.

6. **IMPORTANT**: Return the complete formatted standup message as the final response. Do not summarize or truncate - provide the full text that can be copied directly for use in standup.

Use the Task tool with description "Generate daily standup" for this operation.
