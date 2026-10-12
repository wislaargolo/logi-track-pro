package br.com.logitrack.controller.vehicle;

import br.com.logitrack.dto.vehicle.VehicleDto;
import br.com.logitrack.dto.vehicle.VehicleFilterDto;
import br.com.logitrack.service.vehicle.VehicleService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vehicles")
@Tag(name = "Veículos", description = "Consulta de veículos para seleção")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

  private final VehicleService vehicleService;

  public VehicleController(VehicleService vehicleService) {
    this.vehicleService = vehicleService;
  }

  @GetMapping
  public PagedModel<VehicleDto> findAll(
      @Valid @ModelAttribute VehicleFilterDto filter,
      @SortDefault(
              sort = {"licensePlate", "id"},
              direction = Sort.Direction.ASC)
          Pageable pageable) {
    return new PagedModel<>(vehicleService.findAll(filter, pageable));
  }
}
