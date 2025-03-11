import * as fs from 'fs';
import * as path from 'path';

interface ESLintMessage {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType?: string;
  messageId?: string;
  endLine?: number;
  endColumn?: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
}

/**
 * Processes ESLint diff results and generates a markdown report
 */
function processLintResults(inputFile: string, outputFile: string): void {
  try {
    const results: ESLintResult[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    let markdown = "## ESLint Diff Results\n\n";
    
    const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
    const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);
    
    if (errorCount === 0 && warningCount === 0) {
      markdown += "✅ No new lint issues found!\n";
    } else {
      markdown += `⚠️ Found **${errorCount} errors** and **${warningCount} warnings** in files changed by this PR.\n\n`;
      
      // Group by file
      const fileIssues: Record<string, ESLintMessage[]> = {};
      results.forEach(file => {
        if (file.messages.length > 0) {
          fileIssues[file.filePath] = file.messages;
        }
      });
      
      // Generate details for each file with issues
      Object.keys(fileIssues).forEach(filePath => {
        const fileName = path.basename(filePath);
        markdown += `### ${fileName}\n\n`;
        
        const issues = fileIssues[filePath];
        const table = ["| Line | Column | Severity | Message | Rule |", "|------|--------|----------|---------|------|"];
        
        issues.forEach(issue => {
          const severity = issue.severity === 2 ? "🔴 Error" : "🟡 Warning";
          table.push(`| ${issue.line} | ${issue.column} | ${severity} | ${issue.message} | ${issue.ruleId} |`);
        });
        
        markdown += table.join("\n") + "\n\n";
      });
      
      markdown += "Please fix these issues before merging this PR.";
    }
    
    fs.writeFileSync(outputFile, markdown);
    console.log(`Report written to ${outputFile}`);
    
    // Output counts for GitHub Actions
    console.log(`::set-output name=error_count::${errorCount}`);
    console.log(`::set-output name=warning_count::${warningCount}`);
    
  } catch (error) {
    console.error('Error processing lint results:', error);
    process.exit(1);
  }
}

// When run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node process-lint-diff.ts <input-json-file> <output-markdown-file>');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  processLintResults(inputFile, outputFile);
}

export { processLintResults }; 