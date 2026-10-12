package br.com.logitrack.mapper.maintenance;

import br.com.logitrack.dto.maintenance.MaintenanceDto;
import br.com.logitrack.entity.maintenance.MaintenanceEntity;
import br.com.logitrack.entity.vehicle.VehicleEntity;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceMapper {

  public MaintenanceDto toDto(MaintenanceEntity entity) {
    VehicleEntity vehicle = entity.getVehicle();

    return new MaintenanceDto(
        entity.getId(),
        vehicle == null ? null : vehicle.getId(),
        vehicle == null ? null : vehicle.getLicensePlate(),
        vehicle == null ? null : vehicle.getModel(),
        entity.getStartDate(),
        entity.getExpectedEndDate(),
        entity.getServiceType(),
        entity.getEstimatedCost(),
        entity.getStatus(),
        entity.getObservation());
  }
}
