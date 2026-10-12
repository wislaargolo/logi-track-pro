package br.com.logitrack.dto.maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaintenanceDto(
    Integer id,
    Integer vehicleId,
    String licensePlate,
    String model,
    LocalDate startDate,
    LocalDate expectedEndDate,
    String serviceType,
    BigDecimal estimatedCost,
    String status,
    String observation) {}
