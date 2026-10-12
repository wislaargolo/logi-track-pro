package br.com.logitrack.repository.dashboard;

import br.com.logitrack.repository.dashboard.projection.TripsByCategoryProjection;
import br.com.logitrack.repository.dashboard.projection.UpcomingMaintenanceProjection;
import br.com.logitrack.repository.dashboard.projection.VehicleUtilizationRankingProjection;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DashboardRepository {

  BigDecimal totalKilometers(Integer vehicleId);

  List<TripsByCategoryProjection> tripsByCategory();

  List<UpcomingMaintenanceProjection> upcomingMaintenance(int limit);

  List<VehicleUtilizationRankingProjection> vehicleUtilizationRanking(int limit);

  BigDecimal currentMonthMaintenanceCost(LocalDate startInclusive, LocalDate endExclusive);
}
