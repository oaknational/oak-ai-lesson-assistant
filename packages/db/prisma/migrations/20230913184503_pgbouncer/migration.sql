DO $$
BEGIN
	IF NOT EXISTS (
		SELECT *
		FROM pg_roles
		WHERE rolname = 'pgbouncer'
    ) THEN
		CREATE ROLE pgbouncer;
	END IF;
END
$$;

-- Grant connect permissions to the PgBouncer authentication user
GRANT CONNECT ON DATABASE postgres TO pgbouncer;
--
-- Create the ScaleGrid Schema to hold the authentication function
CREATE SCHEMA IF NOT EXISTS scalegrid_pg;
--
-- GRANT pgbouncer auth user access to the schema
GRANT USAGE ON SCHEMA scalegrid_pg TO pgbouncer;
--
-- Create the function allowing PgBouncer to authenticate users
CREATE OR REPLACE FUNCTION scalegrid_pg.user_lookup(in i_username text, out uname text, out phash text)
RETURNS record AS $$
BEGIN
IF  session_user = 'pgbouncer' THEN
    SELECT usename, passwd FROM pg_catalog.pg_shadow
    WHERE usename = i_username INTO uname, phash;
    RETURN;
ELSE
    RAISE EXCEPTION 'Not an authorised user';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reovke execute permissions for the user lookup function from all entities
REVOKE ALL ON FUNCTION scalegrid_pg.user_lookup(text) FROM PUBLIC;

-- Grant execute only to the pgBouncer user
GRANT EXECUTE ON FUNCTION scalegrid_pg.user_lookup(text) TO pgbouncer;
