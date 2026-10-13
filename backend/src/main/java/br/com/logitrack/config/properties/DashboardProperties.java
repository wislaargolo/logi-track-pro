package br.com.logitrack.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dashboard")
public record DashboardProperties(
    int upcomingMaintenanceLimit, int vehicleUtilizationRankingLimit) {

  public DashboardProperties {
    if (upcomingMaintenanceLimit <= 0) {
      throw new IllegalArgumentException("dashboard.upcoming-maintenance-limit deve ser positivo");
    }

    if (vehicleUtilizationRankingLimit <= 0) {
      throw new IllegalArgumentException(
          "dashboard.vehicle-utilization-ranking-limit deve ser positivo");
    }
  }
}
