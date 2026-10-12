package br.com.logitrack.dto.maintenance;

import br.com.logitrack.entity.maintenance.MaintenanceStatus;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateMaintenanceDto(
    @NotNull(message = "vehicleId é obrigatório.")
        @Positive(message = "vehicleId deve ser positivo.")
        Integer vehicleId,
    @NotNull(message = "startDate é obrigatório.") LocalDate startDate,
    LocalDate expectedEndDate,
    @NotBlank(message = "serviceType é obrigatório.")
        @Size(max = 100, message = "serviceType deve conter no máximo 100 caracteres.")
        String serviceType,
    @NotNull(message = "estimatedCost é obrigatório.")
        @PositiveOrZero(message = "estimatedCost não pode ser negativo.")
        @Digits(
            integer = 8,
            fraction = 2,
            message = "estimatedCost deve conter no máximo 8 dígitos inteiros e 2 casas decimais.")
        BigDecimal estimatedCost,
    @NotNull(message = "status é obrigatório.") MaintenanceStatus status,
    @Size(max = 1000, message = "observation deve conter no máximo 1000 caracteres.")
        String observation) {}
