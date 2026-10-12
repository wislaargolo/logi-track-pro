package br.com.logitrack.repository.dashboard.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpcomingMaintenanceProjection(
    Integer id,
    Integer vehicleId,
    String licensePlate,
    String model,
    LocalDate startDate,
    String serviceType,
    BigDecimal estimatedCost,
    String status) {}
