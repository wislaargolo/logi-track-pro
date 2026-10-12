package br.com.logitrack.utils;

import java.util.Locale;

public final class LikePattern {

  private LikePattern() {}

  public static String escape(String value) {
    return value
        .strip()
        .toLowerCase(Locale.ROOT)
        .replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_");
  }
}
