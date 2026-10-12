package br.com.logitrack.dto.dashboard;

import java.math.BigDecimal;

public record TotalKilometersDto(Integer vehicleId, BigDecimal totalKm) {}
