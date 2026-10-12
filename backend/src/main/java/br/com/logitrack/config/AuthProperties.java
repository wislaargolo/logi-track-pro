package br.com.logitrack.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "auth")
public record AuthProperties(@Valid @NotNull Jwt jwt, @Valid @DefaultValue Bootstrap bootstrap) {

  public record Jwt(
      @NotBlank String secret,
      @NotNull Duration ttl,
      @NotBlank String issuer,
      @NotBlank String audience,
      @NotNull Duration clockSkew) {

    public Jwt {
      if (ttl != null && (ttl.isZero() || ttl.isNegative())) {
        throw new IllegalArgumentException("auth.jwt.ttl deve ser positivo");
      }

      if (clockSkew != null && clockSkew.isNegative()) {
        throw new IllegalArgumentException("auth.jwt.clock-skew não pode ser negativo");
      }
    }

    @Override
    public String toString() {
      return "Jwt[secret=(oculto), ttl="
          + ttl
          + ", issuer="
          + issuer
          + ", audience="
          + audience
          + ", clockSkew="
          + clockSkew
          + "]";
    }
  }

  public record Bootstrap(boolean enabled, String name, String email, String password) {

    public Bootstrap {
      name = name == null ? null : name.trim();
      email = email == null ? null : email.trim();
    }

    @AssertTrue(
        message = "Quando auth.bootstrap.enabled=true, name, email e password são obrigatórios.")
    public boolean isConfigured() {
      return !enabled
          || (name != null
              && !name.isBlank()
              && email != null
              && !email.isBlank()
              && password != null
              && !password.isBlank());
    }

    @Override
    public String toString() {
      return "Bootstrap[enabled=" + enabled + ", password=(oculta)]";
    }
  }
}
