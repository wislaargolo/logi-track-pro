package br.com.logitrack.service.dashboard;

import br.com.logitrack.config.properties.DashboardProperties;
import br.com.logitrack.dto.dashboard.CurrentMonthMaintenanceCostDto;
import br.com.logitrack.dto.dashboard.TotalKilometersDto;
import br.com.logitrack.dto.dashboard.TripsByCategoryDto;
import br.com.logitrack.dto.dashboard.UpcomingMaintenanceDto;
import br.com.logitrack.dto.dashboard.VehicleUtilizationRankingDto;
import br.com.logitrack.mapper.dashboard.DashboardMapper;
import br.com.logitrack.repository.dashboard.DashboardRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

  private final DashboardRepository dashboardRepository;
  private final DashboardMapper dashboardMapper;
  private final Clock clock;
  private final DashboardProperties dashboardProperties;

  public DashboardService(
      DashboardRepository dashboardRepository,
      DashboardMapper dashboardMapper,
      Clock clock,
      DashboardProperties dashboardProperties) {
    this.dashboardRepository = dashboardRepository;
    this.dashboardMapper = dashboardMapper;
    this.clock = clock;
    this.dashboardProperties = dashboardProperties;
  }

  public TotalKilometersDto totalKilometers(Integer vehicleId) {
    return dashboardMapper.toTotalKilometersDto(
        vehicleId, dashboardRepository.totalKilometers(vehicleId));
  }

  public List<TripsByCategoryDto> tripsByCategory() {
    return dashboardRepository.tripsByCategory().stream().map(dashboardMapper::toDto).toList();
  }

  public List<UpcomingMaintenanceDto> upcomingMaintenance() {
    return dashboardRepository
        .upcomingMaintenance(dashboardProperties.upcomingMaintenanceLimit())
        .stream()
        .map(dashboardMapper::toDto)
        .toList();
  }

  public List<VehicleUtilizationRankingDto> vehicleUtilizationRanking() {
    return dashboardRepository
        .vehicleUtilizationRanking(dashboardProperties.vehicleUtilizationRankingLimit())
        .stream()
        .map(dashboardMapper::toDto)
        .toList();
  }

  public CurrentMonthMaintenanceCostDto currentMonthMaintenanceCost() {
    YearMonth month = YearMonth.from(LocalDate.now(clock));

    return dashboardMapper.toCurrentMonthMaintenanceCostDto(
        month,
        dashboardRepository.currentMonthMaintenanceCost(
            month.atDay(1), month.plusMonths(1).atDay(1)));
  }
}
