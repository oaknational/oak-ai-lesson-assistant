#!/usr/bin/env tsx

import { docs_v1 } from "@googleapis/docs";
import { getDocsClient } from "../gSuite/docs/client";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { aiLogger } from "@oakai/logger";
import { QuestionTemplate, QuestionTemplatesSchema } from "../gSuite/docs/questionTemplateSchema";

const __dirname = dirname(fileURLToPath(import.meta.url));

const log = aiLogger("extract-templates");

// Helper function to get a summary of content for logging
function getContentSummary(content: docs_v1.Schema$StructuralElement[]): string[] {
  const summary: string[] = [];
  
  content.forEach((element, index) => {
    if (element.paragraph) {
      const text = element.paragraph.elements
        ?.map(e => e.textRun?.content || "")
        .join("")
        .trim();
      if (text) {
        summary.push(`[${index}] Paragraph: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      }
    } else if (element.table) {
      summary.push(`[${index}] Table: ${element.table.rows}x${element.table.columns}`);
      // Show first few cells
      element.table.tableRows?.slice(0, 2).forEach((row, rowIndex) => {
        row.tableCells?.slice(0, 3).forEach((cell, colIndex) => {
          const cellText = cell.content
            ?.map(e => e.paragraph?.elements?.map(el => el.textRun?.content || "").join("") || "")
            .join("")
            .trim();
          if (cellText) {
            summary.push(`       Cell[${rowIndex},${colIndex}]: "${cellText}"`);
          }
        });
      });
    }
  });
  
  return summary;
}

async function extractTemplates() {
  const templateId = process.env.GOOGLE_DOCS_QUIZ_PARTS_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("GOOGLE_DOCS_QUIZ_PARTS_TEMPLATE_ID not set in .env");
  }

  log.info("Extracting templates from document", { templateId });
  
  const googleDocs = await getDocsClient();
  
  // Get document with tabs
  const doc = await googleDocs.documents.get({
    documentId: templateId,
    includeTabsContent: true,
  });
  
  if (!doc.data.tabs) {
    throw new Error("Document does not have tabs");
  }
  
  const templates: QuestionTemplate[] = [];
  
  // Extract content from each template tab
  for (const tab of doc.data.tabs) {
    const tabName = tab.tabProperties?.title;
    if (!tabName?.startsWith("TEMPLATE-")) {
      continue;
    }
    
    log.info(`Extracting tab: ${tabName}`);
    
    const content = tab.documentTab?.body?.content;
    if (!content) {
      log.warn(`Tab ${tabName} has no content`);
      continue;
    }
    
    templates.push({
      tabName,
      content // Store the raw content array
    });
  }
  
  // Validate templates before saving
  let validatedTemplates: QuestionTemplate[];
  try {
    validatedTemplates = QuestionTemplatesSchema.parse(templates);
    log.info(`Validated ${validatedTemplates.length} templates`);
  } catch (error) {
    log.error("Template validation failed", error);
    throw new Error("Invalid template structure", { cause: error });
  }
  
  // Save to JSON file
  const outputPath = join(__dirname, "../gSuite/docs/questionTemplates.json");
  writeFileSync(outputPath, JSON.stringify(validatedTemplates, null, 2));
  
  log.info(`Extracted ${validatedTemplates.length} templates to ${outputPath}`);
  
  // Also log a summary
  console.log("\n=== EXTRACTED TEMPLATES ===\n");
  templates.forEach(template => {
    console.log(`\n${template.tabName}:`);
    const summary = getContentSummary(template.content);
    summary.forEach(line => console.log(`  ${line}`));
  });
}

// Run the extraction
extractTemplates().catch(error => {
  log.error("Failed to extract templates", error);
  process.exit(1);
});