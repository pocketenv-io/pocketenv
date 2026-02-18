CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION base62_encode(data bytea)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    num numeric := 0;
    result text := '';
    remainder int;
BEGIN
    -- convert bytea to numeric
    FOR i IN 0..length(data)-1 LOOP
        num := num * 256 + get_byte(data, i);
    END LOOP;

    -- convert numeric to base62
    WHILE num > 0 LOOP
        remainder := (num % 62)::int;
        result := substr(chars, remainder+1, 1) || result;
        num := floor(num / 62);
    END LOOP;

    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION sandbox_id()
RETURNS text
LANGUAGE sql
AS $$
SELECT 'sbx_' || base62_encode(gen_random_bytes(16));
$$;
