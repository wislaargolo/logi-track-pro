package br.com.logitrack.repository.dashboard;

public final class DashboardSqlQueries {

  private DashboardSqlQueries() {}

  public static final String TOTAL_KILOMETERS =
      """
            SELECT COALESCE(SUM(t.km_percorrida), 0)
            FROM viagens t
            WHERE (CAST(:vehicleId AS INTEGER) IS NULL OR t.veiculo_id = :vehicleId)
            """;

  public static final String TRIPS_BY_CATEGORY =
      """
            SELECT v.tipo AS "vehicleType", COUNT(t.id) AS "tripCount"
            FROM veiculos v
            LEFT JOIN viagens t
                ON t.veiculo_id = v.id AND t.data_chegada IS NOT NULL
            WHERE v.tipo IN ('LEVE', 'PESADO')
            GROUP BY v.tipo
            ORDER BY v.tipo
            """;

  public static final String UPCOMING_MAINTENANCE =
      """
            SELECT m.id AS "id", m.veiculo_id AS "vehicleId", v.placa AS "licensePlate",
                   v.modelo AS "model", m.data_inicio AS "startDate", m.tipo_servico AS "serviceType",
                   m.custo_estimado AS "estimatedCost", m.status AS "status"
            FROM manutencoes m
            LEFT JOIN veiculos v ON v.id = m.veiculo_id
            WHERE m.status = 'PENDENTE'
            ORDER BY m.data_inicio ASC, m.id ASC
            LIMIT :limit
            """;

  public static final String VEHICLE_UTILIZATION_RANKING =
      """
            SELECT v.id AS "vehicleId", v.placa AS "licensePlate", v.modelo AS "model",
                   COALESCE(SUM(t.km_percorrida), 0) AS "totalKm"
            FROM veiculos v
            LEFT JOIN viagens t ON t.veiculo_id = v.id
            GROUP BY v.id, v.placa, v.modelo
            ORDER BY "totalKm" DESC, v.id ASC
            LIMIT :limit
            """;

  public static final String CURRENT_MONTH_MAINTENANCE_COST =
      """
            SELECT COALESCE(SUM(m.custo_estimado), 0)
            FROM manutencoes m
            WHERE m.data_inicio >= :startInclusive AND m.data_inicio < :endExclusive
            """;
}
