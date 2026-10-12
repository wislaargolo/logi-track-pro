package br.com.logitrack.dto.dashboard;

import java.math.BigDecimal;

public record VehicleUtilizationRankingDto(
    Integer vehicleId, String licensePlate, String model, BigDecimal totalKm) {}
