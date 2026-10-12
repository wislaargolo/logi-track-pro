package br.com.logitrack.service.maintenance;

import br.com.logitrack.dto.maintenance.CreateMaintenanceDto;
import br.com.logitrack.dto.maintenance.MaintenanceDto;
import br.com.logitrack.dto.maintenance.MaintenanceFilterDto;
import br.com.logitrack.dto.maintenance.UpdateMaintenanceDto;
import br.com.logitrack.entity.maintenance.MaintenanceEntity;
import br.com.logitrack.entity.maintenance.MaintenanceStatus;
import br.com.logitrack.entity.vehicle.VehicleEntity;
import br.com.logitrack.exception.BusinessException;
import br.com.logitrack.exception.ResourceNotFoundException;
import br.com.logitrack.mapper.maintenance.MaintenanceMapper;
import br.com.logitrack.repository.maintenance.MaintenanceRepository;
import br.com.logitrack.repository.maintenance.specification.MaintenanceSpecifications;
import br.com.logitrack.service.vehicle.VehicleService;
import br.com.logitrack.utils.PageableUtils;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaintenanceService {

  private static final Set<String> CASE_INSENSITIVE_SORT_FIELDS = Set.of("serviceType");

  private final MaintenanceRepository maintenanceRepository;
  private final VehicleService vehicleService;
  private final MaintenanceMapper maintenanceMapper;

  public MaintenanceService(
      MaintenanceRepository maintenanceRepository,
      VehicleService vehicleService,
      MaintenanceMapper maintenanceMapper) {
    this.maintenanceRepository = maintenanceRepository;
    this.vehicleService = vehicleService;
    this.maintenanceMapper = maintenanceMapper;
  }

  @Transactional(readOnly = true)
  public Page<MaintenanceDto> findAll(MaintenanceFilterDto filter, Pageable pageable) {
    return maintenanceRepository
        .findAll(
            MaintenanceSpecifications.byFilter(filter),
            PageableUtils.ignoreCase(pageable, CASE_INSENSITIVE_SORT_FIELDS))
        .map(maintenanceMapper::toDto);
  }

  @Transactional(readOnly = true)
  public MaintenanceDto findById(Integer id) {
    return maintenanceMapper.toDto(requireMaintenance(id));
  }

  public MaintenanceDto create(CreateMaintenanceDto request) {
    validateDateRange(request.startDate(), request.expectedEndDate());

    VehicleEntity vehicle = requireVehicle(request.vehicleId());
    MaintenanceStatus status =
        request.status() == null ? MaintenanceStatus.PENDENTE : request.status();

    MaintenanceEntity entity =
        new MaintenanceEntity(
            vehicle,
            request.startDate(),
            request.expectedEndDate(),
            request.serviceType().trim(),
            request.estimatedCost(),
            status,
            normalizeObservation(request.observation()));

    return maintenanceMapper.toDto(maintenanceRepository.save(entity));
  }

  public MaintenanceDto update(Integer id, UpdateMaintenanceDto request) {
    validateDateRange(request.startDate(), request.expectedEndDate());

    MaintenanceEntity entity = requireMaintenance(id);
    VehicleEntity vehicle = requireVehicle(request.vehicleId());

    entity.update(
        vehicle,
        request.startDate(),
        request.expectedEndDate(),
        request.serviceType().trim(),
        request.estimatedCost(),
        request.status(),
        normalizeObservation(request.observation()));

    return maintenanceMapper.toDto(maintenanceRepository.save(entity));
  }

  public void delete(Integer id) {
    maintenanceRepository.delete(requireMaintenance(id));
  }

  private MaintenanceEntity requireMaintenance(Integer id) {
    return maintenanceRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Manutenção não encontrada."));
  }

  private VehicleEntity requireVehicle(Integer id) {
    return vehicleService.findRequired(id);
  }

  private void validateDateRange(
      java.time.LocalDate startDate, java.time.LocalDate expectedEndDate) {
    if (expectedEndDate != null && expectedEndDate.isBefore(startDate)) {
      throw new BusinessException("expectedEndDate não pode ser anterior a startDate.");
    }
  }

  private String normalizeObservation(String observation) {
    return observation == null || observation.isEmpty() ? null : observation;
  }
}
