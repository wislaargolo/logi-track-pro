package br.com.logitrack.dto.maintenance;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

public record MaintenanceFilterDto(
    @Positive(message = "vehicleId deve ser positivo.") Integer vehicleId,
    @Size(max = 100, message = "search deve conter no máximo 100 caracteres.") String search,
    @Size(max = 20, message = "status deve conter no máximo 20 caracteres.") String status,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo,
    @Digits(
            integer = 8,
            fraction = 2,
            message =
                "estimatedCostMin deve conter no máximo 8 dígitos inteiros e 2 casas decimais.")
        BigDecimal estimatedCostMin,
    @Digits(
            integer = 8,
            fraction = 2,
            message =
                "estimatedCostMax deve conter no máximo 8 dígitos inteiros e 2 casas decimais.")
        BigDecimal estimatedCostMax) {
  @AssertTrue(message = "startDateFrom não pode ser posterior a startDateTo.")
  public boolean isStartDateRangeValid() {
    return startDateFrom == null || startDateTo == null || !startDateFrom.isAfter(startDateTo);
  }

  @AssertTrue(message = "estimatedCostMin não pode ser maior que estimatedCostMax.")
  public boolean isEstimatedCostRangeValid() {
    return estimatedCostMin == null
        || estimatedCostMax == null
        || estimatedCostMin.compareTo(estimatedCostMax) <= 0;
  }
}
