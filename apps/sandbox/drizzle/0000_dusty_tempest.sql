CREATE SCHEMA xata_private;

--
-- Name: xid; Type: DOMAIN; Schema: xata_private; Owner: -
--

CREATE DOMAIN xata_private.xid AS character(20)
	CONSTRAINT xid_check CHECK ((VALUE ~ '^[a-v0-9]{20}$'::text));

CREATE FUNCTION xata_private.xid(_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP) RETURNS xata_private.xid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    _t INT;
    _m INT;
    _p INT;
    _c INT;
BEGIN
    _t := floor(EXTRACT(epoch FROM _at));
    _m := xata_private._xid_machine_id();
    _p := pg_backend_pid();
    _c := nextval('xata_private.xid_serial')::INT;

    return xata_private.xid_encode(ARRAY [
            (_t >> 24) & 255, (_t >> 16) & 255, (_t >> 8) & 255 , _t & 255,
            (_m >> 16) & 255, (_m >> 8) & 255 , _m & 255,
            (_p >> 8) & 255, _p & 255,
            (_c >> 16) & 255, (_c >> 8) & 255 , _c & 255
        ]);
END;
$$;

CREATE FUNCTION xata_private._xid_machine_id() RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN (SELECT system_identifier & 16777215 FROM pg_control_system());
END;
$$;

CREATE FUNCTION xata_private.xid_encode(_id integer[]) RETURNS xata_private.xid
    LANGUAGE plpgsql
    AS $$
DECLARE
    _encoding CHAR(1)[] = '{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v}';
BEGIN
    RETURN _encoding[1 + (_id[1] >> 3)]
               || _encoding[1 + ((_id[2] >> 6) & 31 | (_id[1] << 2) & 31)]
               || _encoding[1 + ((_id[2] >> 1) & 31)]
               || _encoding[1 + ((_id[3] >> 4) & 31 | (_id[2] << 4) & 31)]
               || _encoding[1 + (_id[4] >> 7 | (_id[3] << 1) & 31)]
               || _encoding[1 + ((_id[4] >> 2) & 31)]
               || _encoding[1 + (_id[5] >> 5 | (_id[4] << 3) & 31)]
               || _encoding[1 + (_id[5] & 31)]
               || _encoding[1 + (_id[6] >> 3)]
               || _encoding[1 + ((_id[7] >> 6) & 31 | (_id[6] << 2) & 31)]
               || _encoding[1 + ((_id[7] >> 1) & 31)]
               || _encoding[1 + ((_id[8] >> 4) & 31 | (_id[7] << 4) & 31)]
               || _encoding[1 + (_id[9] >> 7 | (_id[8] << 1) & 31)]
               || _encoding[1 + ((_id[9] >> 2) & 31)]
               || _encoding[1 + ((_id[10] >> 5) | (_id[9] << 3) & 31)]
               || _encoding[1 + (_id[10] & 31)]
               || _encoding[1 + (_id[11] >> 3)]
               || _encoding[1 + ((_id[12] >> 6) & 31 | (_id[11] << 2) & 31)]
               || _encoding[1 + ((_id[12] >> 1) & 31)]
        || _encoding[1 + ((_id[12] << 4) & 31)];
END;
$$;

CREATE SEQUENCE xata_private.xid_serial
    START WITH 0
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 16777215
    CACHE 1
    CYCLE;

CREATE OR REPLACE FUNCTION xata_id()
RETURNS text AS $$
SELECT 'rec_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION sandbox_id()
RETURNS text AS $$
SELECT 'sbx_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;


CREATE OR REPLACE FUNCTION secret_id()
RETURNS text AS $$
SELECT 'secret_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;


CREATE OR REPLACE FUNCTION variable_id()
RETURNS text AS $$
SELECT 'var_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION snapshot_id()
RETURNS text AS $$
SELECT 'snap_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION volume_id()
RETURNS text AS $$
SELECT 'vol_' || xata_private.xid();
$$ LANGUAGE sql IMMUTABLE;

CREATE TABLE "sandbox_secrets" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"secret_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_variables" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"variable_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_volumes" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"sandbox_id" text NOT NULL,
	"volume_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandboxes" (
	"id" text PRIMARY KEY DEFAULT sandbox_id() NOT NULL,
	"base" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"instance_type" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sandboxes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "secrets" (
	"id" text PRIMARY KEY DEFAULT secret_id() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "secrets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" text PRIMARY KEY DEFAULT snapshot_id() NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "snapshots_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT xata_id() NOT NULL,
	"did" text NOT NULL,
	"display_name" text,
	"handle" text NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_did_unique" UNIQUE("did"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "variables" (
	"id" text PRIMARY KEY DEFAULT variable_id() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "variables_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "volumes" (
	"id" text PRIMARY KEY DEFAULT volume_id() NOT NULL,
	"slug" text NOT NULL,
	"size" integer NOT NULL,
	"size_unit" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "volumes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "sandbox_secrets" ADD CONSTRAINT "sandbox_secrets_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_secrets" ADD CONSTRAINT "sandbox_secrets_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_variables" ADD CONSTRAINT "sandbox_variables_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_variables" ADD CONSTRAINT "sandbox_variables_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_volumes" ADD CONSTRAINT "sandbox_volumes_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_volumes" ADD CONSTRAINT "sandbox_volumes_volume_id_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."volumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandboxes" ADD CONSTRAINT "sandboxes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
