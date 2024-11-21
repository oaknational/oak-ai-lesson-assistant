#!/bin/sh

# Define the tables in the correct order based on dependencies
TABLES="$SCRIPTPATH/tables.txt"

SCRIPT=$(readlink -f "$0")
# Absolute path of the directory this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

sql="BEGIN; TRUNCATE "

echo "Tables: ${TABLES[@]}"

# Reverse the order of the tables so that we can delete them in the correct order
for (( idx=${#TABLES[@]}-1 ; idx>=0 ; idx-- )) do
  sql+="${TABLES[idx]}"
  if [ $idx -eq 0 ];
  then
    sql+=""
  else
    sql+=", "
  fi
done

sql+=" RESTART IDENTITY CASCADE; COMMIT;"

echo "$sql"

URL_WITHOUT_SCHEMA=$(echo "$DATABASE_ADMIN_URL" | cut -f1 -d"?")
echo "Connecting to: $URL_WITHOUT_SCHEMA"

# Execute the truncation
psql "$URL_WITHOUT_SCHEMA?sslmode=verify-ca&sslrootcert=$SCRIPTPATH/../../certs/db_$DB_ENV.pem" -c "$sql"

for table in ${TABLES[@]}; do
  psql "$URL_WITHOUT_SCHEMA?sslmode=verify-ca&sslrootcert=$SCRIPTPATH/../../certs/db_$DB_ENV.pem" -c "\copy $table from $SCRIPTPATH/data/$table.csv delimiter ',' csv header;"
done

echo "Done"