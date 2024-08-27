#!/bin/bash
set -e

# Create users/roles so that migrations for prod all work locally

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER app;
	CREATE USER retool;
	CREATE USER sgpostgres;
	CREATE USER pgbouncer;
EOSQL
