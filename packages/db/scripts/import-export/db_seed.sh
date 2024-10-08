#!/bin/sh

get_local_database_admin_url() {
  read -p "Please enter the local DATABASE_ADMIN_URL (e.g. postgresql://oai:oai@localhost:5432/oai): " local_url
  echo "$local_url"
}


SOURCE_ENV="${1:-dev}"
TARGET_ENV="${2:-live}"

if [ "$SOURCE_ENV" != "dev" ] && [ "$SOURCE_ENV" != "stg" ] && [ "$SOURCE_ENV" != "prd" ]; then
  echo "Error: Invalid source environment. You must specify 'dev' or 'live' as the source environment."
  exit 1
fi

if [ "$TARGET_ENV" != "dev" ] && [ "$TARGET_ENV" != "stg" ] && [ "$TARGET_ENV" != "prd" ]; then
  echo "Error: Invalid target environment. You must specify 'dev' or 'live' as the target environment."
  exit 1
fi

# Determine whether to use the user-provided local DATABASE_ADMIN_URL or the one provided by Doppler
if [ "$SOURCE_ENV" = "dev" ]; then
  SOURCE_URL=$(get_local_database_admin_url)  # Prompt user for local value for dev
else
  SOURCE_URL="${DATABASE_ADMIN_URL}"  # Use Doppler for stg or prd
fi

if [ "$TARGET_ENV" = "dev" ]; then
  TARGET_URL=$(get_local_database_admin_url)  # Prompt user for local value for dev
else
  TARGET_URL="${DATABASE_ADMIN_URL}"  # Use Doppler for stg or prd
fi

# Prevent source and target from being the same unless both are 'dev'
if [ "$SOURCE_URL" = "$TARGET_URL" ] && [ "$SOURCE_ENV" != "$TARGET_ENV" ]; then
  echo "Error: Source and target environments must be different unless both are 'dev'."
  exit 1
fi

# Absolute path to this script
SCRIPT=$(readlink -f "$0")
# Absolute path of the directory this script is in
SCRIPTPATH=$(dirname "$SCRIPT")/scripts/import-export

echo "SCRIPTPATH: $SCRIPTPATH/scripts/import-export"



# Path to tables file
TABLES_FILE="$SCRIPTPATH/tables.txt"



# Check if the tables file exists
if [ ! -f "$TABLES_FILE" ]; then
  echo "Error: tables.txt file not found!"
  exit 1
fi


# Extract the URL without query parameters
SOURCE_URL_WITHOUT_SCHEMA=$(echo "$SOURCE_URL" | cut -f1 -d"?")
TARGET_URL_WITHOUT_SCHEMA=$(echo "$TARGET_URL" | cut -f1 -d"?")

echo "Connecting to source: $SOURCE_URL_WITHOUT_SCHEMA"
echo "Connecting to target: $TARGET_URL_WITHOUT_SCHEMA"

# Ensure environment variables are set
if [ -z "$SOURCE_URL" ] || [ -z "$TARGET_URL" ]; then
  echo "Error: One or more required database URLs are not set."
  exit 1
fi

echo "Starting the seed process from $SOURCE_ENV to $TARGET_ENV..."

# Get the list of all tables in the public schema and store in TABLES array
TABLES=$(psql "$SOURCE_URL_WITHOUT_SCHEMA" -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public';")

# Check if tables were found
if [ -z "$TABLES" ]; then
  echo "No tables found in the public schema."
  exit 1
fi

# Log the number of tables found
TABLE_COUNT=$(echo "$TABLES" | wc -w)
echo "Found $TABLE_COUNT tables to export."

# Loop through all tables and export each one
for table in $TABLES; do
  # Check if the table exists in the tables.txt
  if ! grep -q "^$table$" "$TABLES_FILE"; then
    echo "Table $table is not listed in $TABLES_FILE, skipping export."
    continue
  fi

  echo "Exporting table: $table..."
  OUTPUT_PATH="$SCRIPTPATH/data/$table.csv"
  
  # Execute the export command and check if it succeeded
  if psql "$SOURCE_URL_WITHOUT_SCHEMA" -c "\copy $table to $OUTPUT_PATH delimiter ',' csv header;"; then
    echo "Successfully exported $table to $OUTPUT_PATH"
  else
    echo "Failed to export $table" >&2
  fi
done

# Log the completion of the export process
echo "Export process completed."

# Ask the user if they want to validate the data
read -p "Do you want to validate the exported data? (y/n) " confirm_validate
if [ "$confirm_validate" != "y" ]; then
  echo "Validation skipped."
  exit 0
fi

# Run validation before truncating data
echo "Running data validation..."
if pnpm run validate-data; then
  echo "Data validation successful."
else
  echo "Data validation failed." >&2
  exit 1
fi

# Ask the user if they want to proceed with seeding
echo "Data is valid."
echo "You are about to seed the data into the $TARGET_ENV environment."
read -p "Do you want to continue with the seeding process? (y/n) " confirm_seed
if [ "$confirm_seed" != "y" ]; then
  echo "Seeding process aborted."
  exit 0
fi

# Truncate existing data in the target database before importing new data
echo "Truncating existing data in target database..."
while IFS= read -r table; do
  echo "Truncating table: $table..."
  if psql "$TARGET_URL_WITHOUT_SCHEMA" -c "TRUNCATE TABLE $table RESTART IDENTITY CASCADE;"; then
    echo "Successfully truncated $table"
  else
    echo "Failed to truncate $table" >&2
    exit 1
  fi
done < "$TABLES_FILE"

# Publish process
echo "Starting the publish process..."

while IFS= read -r table; do
  echo "Importing data into table: $table..."
  INPUT_PATH="$SCRIPTPATH/data/$table.csv"
  
  if psql "$TARGET_URL_WITHOUT_SCHEMA" -c "\copy $table FROM $INPUT_PATH CSV HEADER;"; then
    echo "Successfully imported data into $table"
  else
    echo "Failed to import data into $table" >&2
    exit 1
  fi
done < "$TABLES_FILE"

# Log the completion of the publish process
echo "Publish process completed."
