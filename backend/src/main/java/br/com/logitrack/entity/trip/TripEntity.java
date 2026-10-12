package br.com.logitrack.entity.trip;

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
import java.time.LocalDateTime;

@Entity
@Table(name = "viagens")
public class TripEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id")
  private VehicleEntity vehicle;

  @Column(name = "data_saida", nullable = false)
  private LocalDateTime departureAt;

  @Column(name = "data_chegada")
  private LocalDateTime arrivedAt;

  @Column(name = "origem", length = 100)
  private String origin;

  @Column(name = "destino", length = 100)
  private String destination;

  @Column(name = "km_percorrida", precision = 10, scale = 2)
  private BigDecimal kilometers;

  protected TripEntity() {}
}
