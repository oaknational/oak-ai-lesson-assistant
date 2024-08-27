import { ExportableQuizAppState } from "@oakai/exports/src/schema/input.schema";

export function convertQuizToCSV(data: ExportableQuizAppState) {
  // Define the headers for your CSV
  const headers = [
    "Question",
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Answer",
  ];

  // Create an array to hold the CSV rows
  const csvRows: string[][] = [];

  // Loop through each quiz item

  data.questions.forEach((questionItem) => {
    const question = questionItem.question;
    const options = questionItem.allOptions;
    const answers = questionItem.answers;

    // Combine options and answers into a single array
    const allOptions = options.concat(answers);

    // Create a CSV row for this quiz item
    const csvRow = [question, ...allOptions];

    // Push the CSV row to the array of rows
    csvRows.push(csvRow);
  });

  // Join the headers and rows into a complete CSV string
  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  return csvContent;
}
