package br.com.logitrack.mapper.dashboard;

import br.com.logitrack.dto.dashboard.CurrentMonthMaintenanceCostDto;
import br.com.logitrack.dto.dashboard.TotalKilometersDto;
import br.com.logitrack.dto.dashboard.TripsByCategoryDto;
import br.com.logitrack.dto.dashboard.UpcomingMaintenanceDto;
import br.com.logitrack.dto.dashboard.VehicleUtilizationRankingDto;
import br.com.logitrack.entity.vehicle.VehicleType;
import br.com.logitrack.repository.dashboard.projection.TripsByCategoryProjection;
import br.com.logitrack.repository.dashboard.projection.UpcomingMaintenanceProjection;
import br.com.logitrack.repository.dashboard.projection.VehicleUtilizationRankingProjection;
import java.math.BigDecimal;
import java.time.YearMonth;
import org.springframework.stereotype.Component;

@Component
public class DashboardMapper {

  public TotalKilometersDto toTotalKilometersDto(Integer vehicleId, BigDecimal totalKm) {
    return new TotalKilometersDto(vehicleId, totalKm);
  }

  public TripsByCategoryDto toDto(TripsByCategoryProjection projection) {
    String vehicleType = projection.vehicleType();

    return new TripsByCategoryDto(
        vehicleType == null ? null : VehicleType.valueOf(vehicleType), projection.tripCount());
  }

  public UpcomingMaintenanceDto toDto(UpcomingMaintenanceProjection projection) {
    return new UpcomingMaintenanceDto(
        projection.id(),
        projection.vehicleId(),
        projection.licensePlate(),
        projection.model(),
        projection.startDate(),
        projection.serviceType(),
        projection.estimatedCost(),
        projection.status());
  }

  public VehicleUtilizationRankingDto toDto(VehicleUtilizationRankingProjection projection) {
    return new VehicleUtilizationRankingDto(
        projection.vehicleId(),
        projection.licensePlate(),
        projection.model(),
        projection.totalKm());
  }

  public CurrentMonthMaintenanceCostDto toCurrentMonthMaintenanceCostDto(
      YearMonth month, BigDecimal estimatedCost) {
    return new CurrentMonthMaintenanceCostDto(month.toString(), estimatedCost);
  }
}
