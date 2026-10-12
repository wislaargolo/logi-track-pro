package br.com.logitrack.controller.dashboard;

import br.com.logitrack.dto.dashboard.CurrentMonthMaintenanceCostDto;
import br.com.logitrack.dto.dashboard.TotalKilometersDto;
import br.com.logitrack.dto.dashboard.TripsByCategoryDto;
import br.com.logitrack.dto.dashboard.UpcomingMaintenanceDto;
import br.com.logitrack.dto.dashboard.VehicleUtilizationRankingDto;
import br.com.logitrack.service.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Indicadores operacionais da frota")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

  private final DashboardService dashboardService;

  public DashboardController(DashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  @GetMapping("/total-kilometers")
  public TotalKilometersDto totalKilometers(
      @Parameter(description = "Filtra a quilometragem por veículo", example = "1")
          @RequestParam(name = "vehicleId", required = false)
          @Positive(message = "vehicleId deve ser positivo.")
          Integer vehicleId) {
    return dashboardService.totalKilometers(vehicleId);
  }

  @GetMapping("/trips-by-category")
  public List<TripsByCategoryDto> tripsByCategory() {
    return dashboardService.tripsByCategory();
  }

  @GetMapping("/upcoming-maintenance")
  public List<UpcomingMaintenanceDto> upcomingMaintenance() {
    return dashboardService.upcomingMaintenance();
  }

  @GetMapping("/vehicle-utilization-ranking")
  public List<VehicleUtilizationRankingDto> vehicleUtilizationRanking() {
    return dashboardService.vehicleUtilizationRanking();
  }

  @GetMapping("/current-month-maintenance-cost")
  public CurrentMonthMaintenanceCostDto currentMonthMaintenanceCost() {
    return dashboardService.currentMonthMaintenanceCost();
  }
}
