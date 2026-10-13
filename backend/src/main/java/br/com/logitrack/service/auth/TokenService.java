package br.com.logitrack.service.auth;

import br.com.logitrack.config.properties.AuthProperties;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.time.Clock;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

  private final AuthProperties.Jwt properties;
  private final Algorithm algorithm;
  private final Clock clock;

  public TokenService(AuthProperties properties, Algorithm algorithm, Clock clock) {
    this.properties = properties.jwt();
    this.algorithm = algorithm;
    this.clock = clock;
  }

  public String generateToken(Long userId) {
    if (userId == null || userId <= 0) {
      throw new IllegalArgumentException("O identificador do usuário deve ser positivo.");
    }

    Instant issuedAt = clock.instant();

    return JWT.create()
        .withIssuer(properties.issuer())
        .withAudience(properties.audience())
        .withSubject(userId.toString())
        .withIssuedAt(issuedAt)
        .withExpiresAt(issuedAt.plus(properties.ttl()))
        .sign(algorithm);
  }
}
