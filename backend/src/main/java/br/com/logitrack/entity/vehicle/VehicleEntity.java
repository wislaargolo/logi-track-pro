package br.com.logitrack.entity.vehicle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "veiculos")
public class VehicleEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "placa", length = 10, nullable = false, unique = true)
  private String licensePlate;

  @Column(name = "modelo", length = 50, nullable = false)
  private String model;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo", length = 20)
  private VehicleType type;

  @Column(name = "ano")
  private Integer year;

  protected VehicleEntity() {}

  public VehicleEntity(String licensePlate, String model, VehicleType type, Integer year) {
    this.licensePlate = licensePlate;
    this.model = model;
    this.type = type;
    this.year = year;
  }

  public Integer getId() {
    return id;
  }

  public String getLicensePlate() {
    return licensePlate;
  }

  public String getModel() {
    return model;
  }

  public VehicleType getType() {
    return type;
  }

  public Integer getYear() {
    return year;
  }
}
