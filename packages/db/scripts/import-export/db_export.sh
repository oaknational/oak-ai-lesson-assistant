#!/bin/sh

# Absolute path to this script
SCRIPT=$(readlink -f "$0")
# Absolute path of the directory this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

URL_WITHOUT_SCHEMA=`echo "$DATABASE_URL" | cut -f1 -d"?"`
echo "Connecting to: $URL_WITHOUT_SCHEMA"

# Retrieve all table names from the public schema and store them in an array
TABLES=$(psql "$URL_WITHOUT_SCHEMA" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';")

# Export each table to a CSV file
for table in $TABLES; do
  psql "$URL_WITHOUT_SCHEMA" -c "\copy $table to '$SCRIPTPATH/data/$table.csv' delimiter ',' csv header;"
done
