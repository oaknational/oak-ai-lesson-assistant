# Database Migration Scripts

This directory contains scripts for migrating data in the database.

## Quiz V2 Migration

The `migrate-quizzes-to-v2.ts` script migrates all quiz data from V1 format (array-based) to V2 format (object with version field).

### What it does

- Scans all `appSession` records that contain lesson plans
- Identifies V1 format quizzes in `starterQuiz` and `exitQuiz` fields
- Converts them to V2 format using the existing conversion functions
- Updates the database records with the new format

### Usage

```bash
# Navigate to the project root
cd /path/to/oak-ai-lesson-assistant-4

# Dry run - preview what would be changed without modifying the database
pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --dry-run

# Execute the migration
pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts

# Migrate only a specific user's data
pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --user-id=user_xxxxx

# Custom batch size (default is 100)
pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --batch-size=50
```

### Options

- `--dry-run`: Preview changes without modifying the database
- `--user-id=xxx`: Only migrate sessions for a specific user
- `--batch-size=n`: Process sessions in batches of n (default: 100)

### Output

The script provides detailed logging including:

- Progress updates as it processes batches
- Information about each quiz being upgraded
- Final statistics showing:
  - Total sessions processed
  - Sessions containing quizzes
  - Number of quizzes upgraded
  - Any errors encountered
  - Sessions skipped

### Safety

- The script preserves all existing data
- Only the quiz format is changed (V1 → V2)
- All quiz content (questions, answers, distractors) remains identical
- The conversion is idempotent - running it multiple times is safe

### Rollback

If needed, the V2 format can be read by the application even without this migration, as the application has automatic V1→V2 conversion at runtime. However, having all data in V2 format improves performance and consistency.
