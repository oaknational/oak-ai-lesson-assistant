ALTER TABLE "prompts"
	ADD COLUMN "input_schema" JSONB,
	ADD COLUMN "output_schema" JSONB;

UPDATE
	prompts
SET
	input_schema = '{"properties": {}}', output_schema = '{"properties": {}}';


ALTER TABLE "prompts"
  ALTER COLUMN "input_schema" SET NOT NULL,
  ALTER COLUMN "output_schema" SET NOT NULL;
