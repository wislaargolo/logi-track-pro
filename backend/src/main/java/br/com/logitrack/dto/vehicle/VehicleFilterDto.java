package br.com.logitrack.dto.vehicle;

import jakarta.validation.constraints.Size;

public record VehicleFilterDto(
    @Size(max = 100, message = "search deve conter no máximo 100 caracteres.") String search) {}
