package br.com.logitrack.service.vehicle;

import br.com.logitrack.dto.vehicle.VehicleDto;
import br.com.logitrack.dto.vehicle.VehicleFilterDto;
import br.com.logitrack.entity.vehicle.VehicleEntity;
import br.com.logitrack.exception.ResourceNotFoundException;
import br.com.logitrack.mapper.vehicle.VehicleMapper;
import br.com.logitrack.repository.vehicle.VehicleRepository;
import br.com.logitrack.repository.vehicle.specification.VehicleSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

  private final VehicleRepository vehicleRepository;
  private final VehicleMapper vehicleMapper;

  public VehicleService(VehicleRepository vehicleRepository, VehicleMapper vehicleMapper) {
    this.vehicleRepository = vehicleRepository;
    this.vehicleMapper = vehicleMapper;
  }

  @Transactional(readOnly = true)
  public Page<VehicleDto> findAll(VehicleFilterDto filter, Pageable pageable) {
    return vehicleRepository
        .findAll(VehicleSpecifications.byFilter(filter), pageable)
        .map(vehicleMapper::toDto);
  }

  @Transactional(readOnly = true)
  public VehicleEntity findRequired(Integer id) {
    return vehicleRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado."));
  }
}
