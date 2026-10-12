package br.com.logitrack.repository.dashboard.projection;

import java.math.BigDecimal;

public record VehicleUtilizationRankingProjection(
    Integer vehicleId, String licensePlate, String model, BigDecimal totalKm) {}
