import * as Sequelize from 'sequelize'

async function up (utils: {
  transaction: Sequelize.Transaction
  queryInterface: Sequelize.QueryInterface
  sequelize: Sequelize.Sequelize
}): Promise<void> {
  const { transaction } = utils

  await utils.sequelize.query(
    'ALTER TABLE "video" ADD COLUMN "searchVector" tsvector',
    { transaction }
  )

  await utils.sequelize.query(
    `UPDATE "video" SET "searchVector" = to_tsvector('simple', unaccent(coalesce(name, '') || ' ' || coalesce(description, '')))`,
    { transaction }
  )

  await utils.sequelize.query(
    'CREATE INDEX "video_search_vector_idx" ON "video" USING GIN ("searchVector")',
    { transaction }
  )

  await utils.sequelize.query(
    `CREATE OR REPLACE FUNCTION "video_search_vector_update"() RETURNS trigger AS $$
    BEGIN
      NEW."searchVector" := to_tsvector('simple', unaccent(coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, '')));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`,
    { transaction }
  )

  await utils.sequelize.query(
    `CREATE TRIGGER "video_search_vector_trigger"
    BEFORE INSERT OR UPDATE OF name, description ON "video"
    FOR EACH ROW EXECUTE FUNCTION "video_search_vector_update"()`,
    { transaction }
  )
}

function down (options) {
  throw new Error('Not implemented.')
}

export {
  down,
  up
}
