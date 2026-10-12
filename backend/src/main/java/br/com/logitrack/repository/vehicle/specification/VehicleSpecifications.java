package br.com.logitrack.repository.vehicle.specification;

import br.com.logitrack.dto.vehicle.VehicleFilterDto;
import br.com.logitrack.entity.vehicle.VehicleEntity;
import br.com.logitrack.utils.LikePattern;
import org.springframework.data.jpa.domain.Specification;

public final class VehicleSpecifications {

  private VehicleSpecifications() {}

  public static Specification<VehicleEntity> byFilter(VehicleFilterDto filter) {
    if (filter.search() == null || filter.search().isBlank()) {
      return Specification.unrestricted();
    }
    String pattern = "%" + LikePattern.escape(filter.search()) + "%";
    return (root, query, builder) ->
        builder.or(
            builder.like(builder.lower(root.get("licensePlate")), pattern, '\\'),
            builder.like(builder.lower(root.get("model")), pattern, '\\'));
  }
}
