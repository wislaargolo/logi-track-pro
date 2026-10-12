package br.com.logitrack.utils;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageableUtils {

  private PageableUtils() {}

  public static Pageable ignoreCase(Pageable pageable, Set<String> fields) {
    if (pageable.isUnpaged() || pageable.getSort().isUnsorted()) {
      return pageable;
    }

    var orders =
        pageable.getSort().stream()
            .map(order -> fields.contains(order.getProperty()) ? order.ignoreCase() : order)
            .toList();

    return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
  }
}
