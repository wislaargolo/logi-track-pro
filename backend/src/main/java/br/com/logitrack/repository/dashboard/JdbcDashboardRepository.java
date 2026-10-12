package br.com.logitrack.repository.dashboard;

import br.com.logitrack.repository.dashboard.projection.TripsByCategoryProjection;
import br.com.logitrack.repository.dashboard.projection.UpcomingMaintenanceProjection;
import br.com.logitrack.repository.dashboard.projection.VehicleUtilizationRankingProjection;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDashboardRepository implements DashboardRepository {

  private final JdbcClient jdbcClient;

  public JdbcDashboardRepository(JdbcClient jdbcClient) {
    this.jdbcClient = jdbcClient;
  }

  @Override
  public BigDecimal totalKilometers(Integer vehicleId) {
    return jdbcClient
        .sql(DashboardSqlQueries.TOTAL_KILOMETERS)
        .param("vehicleId", vehicleId)
        .query(JdbcDashboardRepository::mapBigDecimal)
        .single();
  }

  @Override
  public List<TripsByCategoryProjection> tripsByCategory() {
    return jdbcClient
        .sql(DashboardSqlQueries.TRIPS_BY_CATEGORY)
        .query(JdbcDashboardRepository::mapTrips)
        .list();
  }

  @Override
  public List<UpcomingMaintenanceProjection> upcomingMaintenance(int limit) {
    return jdbcClient
        .sql(DashboardSqlQueries.UPCOMING_MAINTENANCE)
        .param("limit", limit)
        .query(JdbcDashboardRepository::mapUpcomingMaintenance)
        .list();
  }

  @Override
  public List<VehicleUtilizationRankingProjection> vehicleUtilizationRanking(int limit) {
    return jdbcClient
        .sql(DashboardSqlQueries.VEHICLE_UTILIZATION_RANKING)
        .param("limit", limit)
        .query(JdbcDashboardRepository::mapVehicleUtilization)
        .list();
  }

  @Override
  public BigDecimal currentMonthMaintenanceCost(LocalDate startInclusive, LocalDate endExclusive) {
    return jdbcClient
        .sql(DashboardSqlQueries.CURRENT_MONTH_MAINTENANCE_COST)
        .param("startInclusive", startInclusive)
        .param("endExclusive", endExclusive)
        .query(JdbcDashboardRepository::mapBigDecimal)
        .single();
  }

  private static BigDecimal mapBigDecimal(ResultSet resultSet, int rowNumber) throws SQLException {
    return resultSet.getBigDecimal(1);
  }

  private static TripsByCategoryProjection mapTrips(ResultSet resultSet, int rowNumber)
      throws SQLException {
    return new TripsByCategoryProjection(
        resultSet.getString("vehicleType"), resultSet.getLong("tripCount"));
  }

  private static UpcomingMaintenanceProjection mapUpcomingMaintenance(
      ResultSet resultSet, int rowNumber) throws SQLException {
    return new UpcomingMaintenanceProjection(
        resultSet.getObject("id", Integer.class),
        resultSet.getObject("vehicleId", Integer.class),
        resultSet.getString("licensePlate"),
        resultSet.getString("model"),
        resultSet.getObject("startDate", LocalDate.class),
        resultSet.getString("serviceType"),
        resultSet.getBigDecimal("estimatedCost"),
        resultSet.getString("status"));
  }

  private static VehicleUtilizationRankingProjection mapVehicleUtilization(
      ResultSet resultSet, int rowNumber) throws SQLException {
    return new VehicleUtilizationRankingProjection(
        resultSet.getObject("vehicleId", Integer.class),
        resultSet.getString("licensePlate"),
        resultSet.getString("model"),
        resultSet.getBigDecimal("totalKm"));
  }
}
