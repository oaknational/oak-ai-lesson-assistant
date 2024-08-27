# Importing New Lessons

## Expected Outcomes:
New lessons have been successfully imported into the SQL database.


##Success:
- New row in lessons table
- Multiple choice quiz has been broken up into the answers and questions tables
- The transcipt is in the transcript table and a lesson summary has been created
- Finally embeddings has been run across all of this database

## Step 1:
In the `importNewLessons` script, define a keystage and subject, and run the following command:

"process:importNewLessons"

Verify in the database that the expected number of lessons, questions, and answers have been created.

## Step 2:
Run the following command:

"process:getTranscriptsForNewLessons"

Verify that the number of transcripts matches the number of new lessons.

## Step 3:
Run the following command:

"process:createSnippetsForNewLessons"

## Step 4:
Execute the following steps:

1. Run the development server:

"pnpm run dev"

2. Open localhost:8288 in your browser.

3. In the functions folder, run the following commands in order:

    - Generate snippets for all questions that do not have them.

    "generateSnippets"

    - Generate summaries for all lessons.

    "generateSummaries"

    - Generate embeddings for all lesson summaries that do not have them.

    "generateLessonEmbeddings"

    - Generate embeddings for all snippets that do not have them.

    "generateSnippetEmbeddings"

**Note:** Each of these steps may take a considerable amount of time.
