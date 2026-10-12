package br.com.logitrack.mapper.vehicle;

import br.com.logitrack.dto.vehicle.VehicleDto;
import br.com.logitrack.entity.vehicle.VehicleEntity;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

  public VehicleDto toDto(VehicleEntity entity) {
    return new VehicleDto(entity.getId(), entity.getLicensePlate(), entity.getModel());
  }
}
