const up = async (knex) => {
  return knex.schema.createTableIfNotExists('UsageAi', (table) => {
    table.increments('id');
    table.string('model', 255).notNullable();
    table.string('context', 255).notNullable();
    table.string('requestUuid', 32).notNullable();
    table.integer('inputTokens', 11);
    table.integer('outputTokens', 11);
    table.integer('totalTokens', 11);
    table.integer('inputSize', 11);
    table.integer('audioDuration', 11);
    // ---
    table.timestamps(false, true);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    // table.timestamp('updatedAt').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.timestamp('deletedAt');
  });
}
const down = async (knex) => knex.schema.dropTableIfExists('UsageAi');


module.exports = {
  up,
  down
}