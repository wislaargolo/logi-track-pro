package br.com.logitrack.dto.dashboard;

import java.math.BigDecimal;

public record CurrentMonthMaintenanceCostDto(String month, BigDecimal estimatedCost) {}
