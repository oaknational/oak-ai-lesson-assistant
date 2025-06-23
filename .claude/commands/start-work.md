Start a new piece of work from a specific Notion task ID. Usage: `/start-work [NOTION_TASK_ID]`

**Process:**

1. **Load task from Notion:**

   - Fetch task details using the provided Notion task ID
   - Extract title, description, requirements, and task type
   - Note any acceptance criteria or linked documentation

2. **Create git branch:**

   - Determine branch type from task type (feat/fix/chore/etc)
   - Extract ticket ID from task for branch naming
   - Follow CLAUDE.md convention: `feat/AI-XXXX-description`
   - Ensure we start from main: `git checkout main && git pull`
   - Create and checkout the new branch: `git checkout -b [branch-name]`

3. **Update task status:**

   - Change Notion task status from "Ready" to "In progress"
   - Confirm the status update

4. **Provide work context:**
   - Display task requirements and acceptance criteria
   - Summarize what needs to be implemented
   - Suggest initial implementation approach based on codebase knowledge
   - Identify relevant files or areas to investigate

**Output:**

- Confirm branch created and checked out
- Display task summary with clear requirements
- Provide next steps for implementation
