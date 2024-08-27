#!/bin/sh

#TABLES=("key_stages" "subjects" "key_stage_subjects" "summarisation_strategies" "lessons" "questions" "answers" "lesson_summaries" "transcripts" "snippets" )
TABLES=("lesson_plans" "lesson_plan_parts")
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

sql+="; COMMIT;"

echo "$sql"

URL_WITHOUT_SCHEMA=`echo "$DATABASE_ADMIN_URL" | cut -f1 -d"?"`
echo "Connecting to: $URL_WITHOUT_SCHEMA"

psql "$URL_WITHOUT_SCHEMA?sslmode=verify-ca&sslrootcert=$SCRIPTPATH/../../certs/db_$DB_ENV.pem" -c "$sql"

for table in ${TABLES[@]}; do
  psql "$URL_WITHOUT_SCHEMA?sslmode=verify-ca&sslrootcert=$SCRIPTPATH/../../certs/db_$DB_ENV.pem" -c "\copy $table from $SCRIPTPATH/data/$table.csv delimiter ',' csv header;"
done

echo "Done"