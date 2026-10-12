package br.com.logitrack.repository.vehicle;

import br.com.logitrack.entity.vehicle.VehicleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VehicleRepository
    extends JpaRepository<VehicleEntity, Integer>, JpaSpecificationExecutor<VehicleEntity> {}
