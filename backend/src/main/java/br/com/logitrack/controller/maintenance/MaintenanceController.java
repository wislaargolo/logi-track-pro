package br.com.logitrack.controller.maintenance;

import br.com.logitrack.dto.maintenance.CreateMaintenanceDto;
import br.com.logitrack.dto.maintenance.MaintenanceDto;
import br.com.logitrack.dto.maintenance.MaintenanceFilterDto;
import br.com.logitrack.dto.maintenance.UpdateMaintenanceDto;
import br.com.logitrack.service.maintenance.MaintenanceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/maintenance")
@Tag(name = "Manutenções", description = "Cadastro e consulta de manutenções de veículos")
@SecurityRequirement(name = "bearerAuth")
public class MaintenanceController {

  private final MaintenanceService maintenanceService;

  public MaintenanceController(MaintenanceService maintenanceService) {
    this.maintenanceService = maintenanceService;
  }

  @GetMapping
  public PagedModel<MaintenanceDto> findAll(
      @Valid @ModelAttribute MaintenanceFilterDto filter,
      @SortDefault(
              sort = {"startDate", "id"},
              direction = Sort.Direction.ASC)
          Pageable pageable) {
    return new PagedModel<>(maintenanceService.findAll(filter, pageable));
  }

  @GetMapping("/{id}")
  public MaintenanceDto findById(@PathVariable Integer id) {
    return maintenanceService.findById(id);
  }

  @PostMapping
  public ResponseEntity<MaintenanceDto> create(@Valid @RequestBody CreateMaintenanceDto request) {
    MaintenanceDto created = maintenanceService.create(request);

    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();

    return ResponseEntity.created(location).body(created);
  }

  @PutMapping("/{id}")
  public MaintenanceDto update(
      @PathVariable Integer id, @Valid @RequestBody UpdateMaintenanceDto request) {
    return maintenanceService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Integer id) {
    maintenanceService.delete(id);

    return ResponseEntity.noContent().build();
  }
}
