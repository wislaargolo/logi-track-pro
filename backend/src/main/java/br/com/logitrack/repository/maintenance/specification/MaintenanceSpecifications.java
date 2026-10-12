package br.com.logitrack.repository.maintenance.specification;

import br.com.logitrack.dto.maintenance.MaintenanceFilterDto;
import br.com.logitrack.entity.maintenance.MaintenanceEntity;
import br.com.logitrack.utils.LikePattern;
import jakarta.persistence.criteria.JoinType;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public final class MaintenanceSpecifications {

  private MaintenanceSpecifications() {}

  public static Specification<MaintenanceEntity> byFilter(MaintenanceFilterDto filter) {
    return Specification.allOf(
        hasVehicleId(filter.vehicleId()),
        searchContains(filter.search()),
        hasStatus(filter.status()),
        startsOnOrAfter(filter.startDateFrom()),
        startsOnOrBefore(filter.startDateTo()),
        costsAtLeast(filter.estimatedCostMin()),
        costsAtMost(filter.estimatedCostMax()));
  }

  private static Specification<MaintenanceEntity> hasVehicleId(Integer vehicleId) {
    return vehicleId == null
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.equal(root.get("vehicle").get("id"), vehicleId);
  }

  private static Specification<MaintenanceEntity> hasStatus(String status) {
    return status == null || status.isBlank()
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.equal(root.get("status"), status);
  }

  private static Specification<MaintenanceEntity> searchContains(String search) {
    if (search == null || search.isBlank()) {
      return Specification.unrestricted();
    }
    String pattern = "%" + LikePattern.escape(search) + "%";
    return (root, query, builder) -> {
      var vehicle = root.join("vehicle", JoinType.LEFT);
      return builder.or(
          builder.like(builder.lower(root.get("serviceType")), pattern, '\\'),
          builder.like(builder.lower(vehicle.get("licensePlate")), pattern, '\\'),
          builder.like(builder.lower(vehicle.get("model")), pattern, '\\'));
    };
  }

  private static Specification<MaintenanceEntity> startsOnOrAfter(LocalDate date) {
    return date == null
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("startDate"), date);
  }

  private static Specification<MaintenanceEntity> startsOnOrBefore(LocalDate date) {
    return date == null
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.lessThanOrEqualTo(root.get("startDate"), date);
  }

  private static Specification<MaintenanceEntity> costsAtLeast(BigDecimal cost) {
    return cost == null
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("estimatedCost"), cost);
  }

  private static Specification<MaintenanceEntity> costsAtMost(BigDecimal cost) {
    return cost == null
        ? Specification.unrestricted()
        : (root, query, builder) -> builder.lessThanOrEqualTo(root.get("estimatedCost"), cost);
  }
}
