#!/bin/sh

# The tables to export, in orders.
#TABLES=( "prompt" "generations" "apps" )
TABLES=( "lesson_plans" "lesson_plan_parts" )
# Absolute path to this script
SCRIPT=$(readlink -f "$0")
# Absolute path of the directory this script is in
SCRIPTPATH=$(dirname "$SCRIPT")

URL_WITHOUT_SCHEMA=`echo "$DATABASE_URL" | cut -f1 -d"?"`
echo "Connecting to: $URL_WITHOUT_SCHEMA"
# psql "$URL_WITHOUT_SCHEMA" -c "\copy questions to $SCRIPTPATH/data/questions.csv delimiter ',' csv header;"

for table in ${TABLES[@]}; do
  psql "$URL_WITHOUT_SCHEMA" -c "\copy $table to $SCRIPTPATH/data/$table.csv delimiter ',' csv header;"
done
