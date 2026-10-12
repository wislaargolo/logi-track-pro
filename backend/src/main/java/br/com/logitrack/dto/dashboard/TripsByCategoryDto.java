package br.com.logitrack.dto.dashboard;

import br.com.logitrack.entity.vehicle.VehicleType;

public record TripsByCategoryDto(VehicleType vehicleType, long tripCount) {}
