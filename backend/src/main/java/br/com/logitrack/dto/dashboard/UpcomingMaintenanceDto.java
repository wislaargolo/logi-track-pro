package br.com.logitrack.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpcomingMaintenanceDto(
    Integer id,
    Integer vehicleId,
    String licensePlate,
    String model,
    LocalDate startDate,
    String serviceType,
    BigDecimal estimatedCost,
    String status) {}
