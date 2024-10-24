/**
 *
 * This script validates the data in the CSV files against the constraints defined in the Prisma schema.
 *
 **/
import { Prisma } from "@prisma/client";
import csvParser from "csv-parser";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import { prisma } from "../..";

const dataDir = path.join(__dirname, "data");

dotenv.config();

// Helper function to log messages
const log = (message: string) => {
  console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
};

// Helper function to get the Prisma model metadata
async function getModelConstraints() {
  log("Inferring model constraints from Prisma schema...");
  const modelConstraints: Record<string, any> = {};

  const models = Prisma.dmmf.datamodel.models;

  models.forEach((model) => {
    if (model.dbName) {
      const tablesFilePath = path.join(__dirname, "tables.txt");
      const tables = fs.readFileSync(tablesFilePath, "utf-8").split("\n").map(t => t.trim());

      if (!tables.includes(model.dbName)) {
        return;
      }

      console.log(`Processing model: ${model.dbName}`);
      log(`Processing model: ${model.dbName}`);

      const nonNullable = model.fields
        .filter(
          (field) =>
            field.isRequired && !field.relationName && !field.hasDefaultValue,
        )
        .map((field) => field.dbName || field.name); // Use `field.name` as fallback if `field.dbName` is undefined

      const foreignKeys = model.fields
        .filter((field) => field.relationName)
        .reduce(
          (acc, field) => {
            const CamelCaseToSnakeCase = (str: string) => {
              const newStr = str.replace(
                /[A-Z]/g,
                (letter) => `_${letter.toLowerCase()}`,
              );
              return newStr.replace(/^_/, "");
            };

            const refTable = CamelCaseToSnakeCase(field.type);
            acc[CamelCaseToSnakeCase(field.name)] = refTable;
            return acc;
          },
          {} as Record<string, string>,
        );

      modelConstraints[model.dbName] = {
        nonNullable,
        foreignKeys,
      };
    }
  });

  return modelConstraints;
}

const validateCSV = (
  filePath: string,
  nonNullable: string[],
  foreignKeys: Record<string, string>,
) => {
  return new Promise<void>((resolve, reject) => {
    const errors: string[] = [];
    const foreignKeyCheck: Record<string, Set<any>> = {};

    log(`Validating CSV file: ${filePath}`);
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: any) => {
        // Check non-nullable fields
        nonNullable.forEach((col) => {
          if (!row[col]) {
            errors.push(
              `NULL value found in non-nullable column '${col}' in row ${JSON.stringify(
                row,
              )}`,
            );
          }
        });

        for (const [fk, refTable] of Object.entries(foreignKeys)) {
          if (!foreignKeyCheck[fk]) {
            foreignKeyCheck[fk] = new Set();
          }
          if (row[fk]) {
            foreignKeyCheck[fk]!.add(row[fk]);
          }
        }
      })
      .on("end", async () => {
        log(`Completed reading CSV file: ${filePath}`);

        // Validate foriegn keys in CSV
        for (const [fk, refTable] of Object.entries(foreignKeys)) {
          const ids: string[] = Array.from(foreignKeyCheck[fk] || []);

          function handleTable(table: string) {
            if (table === "key_stage") {
              return "key_stages";
            }
          }

          if (ids.length > 0) {
            const refFilePath = path.join(
              dataDir,
              `${handleTable(refTable)}.csv`,
            );
            if (!fs.existsSync(refFilePath)) {
              errors.push(
                `CSV file for referenced table '${refTable}' does not exist.`,
              );
            } else {
              const refIds = new Set<string>();
              fs.createReadStream(refFilePath)
                .pipe(csvParser())
                .on("data", (row: any) => {
                  refIds.add(row.id);
                })
                .on("end", () => {
                  ids.forEach((id: string) => {
                    if (!refIds.has(id)) {
                      errors.push(
                        `Broken foreign key: '${fk}' references '${refTable}' but value '${id}' does not exist in table '${refTable}'.`,
                      );
                    }
                  });
                });
            }
          }
        }

        if (errors.length > 0) {
          log(`Validation failed for CSV file: ${filePath}`);
          reject(errors);
        } else {
          log(`Validation passed for CSV file: ${filePath}`);
          resolve();
        }
      })
      .on("error", (error) => {
        reject(`Error reading CSV file: ${filePath}. Error: ${error.message}`);
      });
  });
};

const main = async () => {
  try {
    const modelConstraints = await getModelConstraints();

    for (const [table, constraints] of Object.entries(modelConstraints)) {
      const filePath = path.join(dataDir, `${table}.csv`);
      if (!fs.existsSync(filePath)) {
        console.error(`CSV file for table '${table}' does not exist.`);
        process.exit(1);
      }

      try {
        await validateCSV(
          filePath,
          constraints.nonNullable,
          constraints.foreignKeys,
        );
        log(`Validation passed for table '${table}'`);
      } catch (errors) {
        console.error(`Validation failed for table '${table}':\n`, errors);
        process.exit(1);
      }
    }

    log("All tables validated successfully.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    console.log("Done");
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
