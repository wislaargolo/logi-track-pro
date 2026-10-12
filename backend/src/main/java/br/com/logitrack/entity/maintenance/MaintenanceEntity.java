package br.com.logitrack.entity.maintenance;

import br.com.logitrack.entity.vehicle.VehicleEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "manutencoes")
public class MaintenanceEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id")
  private VehicleEntity vehicle;

  @Column(name = "data_inicio", nullable = false)
  private LocalDate startDate;

  @Column(name = "data_finalizacao")
  private LocalDate expectedEndDate;

  @Column(name = "tipo_servico", length = 100)
  private String serviceType;

  @Column(name = "observacao", length = 1000)
  private String observation;

  @Column(name = "custo_estimado", precision = 10, scale = 2)
  private BigDecimal estimatedCost;

  @Column(name = "status", length = 20)
  private String status;

  protected MaintenanceEntity() {}

  public MaintenanceEntity(
      VehicleEntity vehicle,
      LocalDate startDate,
      LocalDate expectedEndDate,
      String serviceType,
      BigDecimal estimatedCost,
      MaintenanceStatus status,
      String observation) {
    update(vehicle, startDate, expectedEndDate, serviceType, estimatedCost, status, observation);
  }

  public void update(
      VehicleEntity vehicle,
      LocalDate startDate,
      LocalDate expectedEndDate,
      String serviceType,
      BigDecimal estimatedCost,
      MaintenanceStatus status,
      String observation) {
    this.vehicle = vehicle;
    this.startDate = startDate;
    this.expectedEndDate = expectedEndDate;
    this.serviceType = serviceType;
    this.estimatedCost = estimatedCost;
    this.status = status == null ? null : status.name();
    this.observation = observation;
  }

  public Integer getId() {
    return id;
  }

  public VehicleEntity getVehicle() {
    return vehicle;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public LocalDate getExpectedEndDate() {
    return expectedEndDate;
  }

  public String getServiceType() {
    return serviceType;
  }

  public String getObservation() {
    return observation;
  }

  public BigDecimal getEstimatedCost() {
    return estimatedCost;
  }

  public String getStatus() {
    return status;
  }
}
