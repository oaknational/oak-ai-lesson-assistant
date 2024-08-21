#!/bin/sh

# Absolute path to this script
SCRIPT=$(readlink -f "$0")
# Absolute path of the directory this script is in
SCRIPTPATH=$(dirname "$SCRIPT")
URL_WITHOUT_SCHEMA=`echo "$DATABASE_ADMIN_URL" | cut -f1 -d"?"`
echo "Connecting to: $URL_WITHOUT_SCHEMA"

DATABASE_URL="$URL_WITHOUT_SCHEMA?sslmode=verify-ca&sslrootcert=$SCRIPTPATH/../certs/db_$DB_ENV.pem"
DIRECT_DATABASE_URL="$DATABASE_URL"
npx prisma migrate deploy