import type { PrismaClientWithAccelerate } from "@oakai/db";
import { Prisma } from "@oakai/db";

export class Statistics {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async updateMedianGenerationTotalDurations() {
    /**
     * Calculate the median by
     * 1. taking the duration of completed_at-created_at
     * 2. converting to an epoch, then *1000 for ms
     * 3. calculating the median with percentile_cont
     * 4. rounding the result by casting to int
     */
    const sql = this.getStatsUpsertSql(
      Prisma.raw("median-generation-total-duration-ms"),
      Prisma.raw(
        "percentile_cont(0.5) WITHIN GROUP (ORDER BY (EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000))::INT",
      ),
    );
    await this.prisma.$executeRaw(sql);
  }

  async updateMeanGenerationTotalDurations() {
    const sql = this.getStatsUpsertSql(
      Prisma.raw("mean-generation-total-duration-ms"),
      Prisma.raw(
        "AVG((EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000))::INT",
      ),
    );
    await this.prisma.$executeRaw(sql);
  }

  async updateMedianGenerationLlmDurations() {
    const sql = this.getStatsUpsertSql(
      Prisma.raw("median-generation-llm-duration-ms"),
      Prisma.raw(
        "ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY llm_time_taken))",
      ),
    );
    await this.prisma.$executeRaw(sql);
  }

  async updateMeanGenerationLlmDurations() {
    const sql = this.getStatsUpsertSql(
      Prisma.raw("mean-generation-llm-duration-ms"),
      Prisma.raw("AVG(generations.llm_time_taken)::INT"),
    );
    await this.prisma.$executeRaw(sql);
  }

  /**
   * Return a SQL string
   */
  getStatsUpsertSql(
    statName: Prisma.Sql,
    sqlValueCalculation: Prisma.Sql,
  ): Prisma.Sql {
    return Prisma.sql`
      WITH stat_values AS (
        SELECT
          gen_random_uuid () AS id,
          '${statName}' AS name,
          generations.app_id AS app_id,
          generations.prompt_id AS prompt_id,
          ${sqlValueCalculation} AS value,
          now() AS last_updated
        FROM
          generations
        WHERE
          generations.llm_time_taken IS NOT NULL
        GROUP BY
          generations.app_id,
          generations.prompt_id
      )
      INSERT INTO "statistics" (id, name, app_id, prompt_id, value, last_updated)
      SELECT * FROM stat_values
      ON CONFLICT (name, app_id, prompt_id) DO UPDATE SET
        value = EXCLUDED.value,
        last_updated = EXCLUDED.last_updated;
    `;
  }
}
