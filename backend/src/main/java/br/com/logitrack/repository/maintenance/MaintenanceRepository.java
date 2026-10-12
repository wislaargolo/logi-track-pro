package br.com.logitrack.repository.maintenance;

import br.com.logitrack.entity.maintenance.MaintenanceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MaintenanceRepository
    extends JpaRepository<MaintenanceEntity, Integer>, JpaSpecificationExecutor<MaintenanceEntity> {
  @Override
  @EntityGraph(attributePaths = "vehicle")
  Page<MaintenanceEntity> findAll(
      Specification<MaintenanceEntity> specification, Pageable pageable);
}
