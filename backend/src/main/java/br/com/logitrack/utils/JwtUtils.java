package br.com.logitrack.utils;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;

public final class JwtUtils {

  private JwtUtils() {}

  public static Jwt decode(String token, JWTVerifier verifier) {
    try {
      DecodedJWT decoded = verifier.verify(token);
      if (!isValidSubject(decoded.getSubject())) {
        throw new JWTVerificationException("Claims do JWT inválidos.");
      }
      Instant expiresAt = decoded.getExpiresAtAsInstant();
      if (expiresAt == null) {
        throw new JWTVerificationException("O JWT deve conter uma data de expiração.");
      }

      Map<String, Object> headers = new LinkedHashMap<>();
      headers.put("alg", decoded.getAlgorithm());
      if (decoded.getType() != null) {
        headers.put("typ", decoded.getType());
      }

      Map<String, Object> claims = new LinkedHashMap<>();
      claims.put(JwtClaimNames.ISS, decoded.getIssuer());
      claims.put(JwtClaimNames.SUB, decoded.getSubject());
      claims.put(JwtClaimNames.AUD, decoded.getAudience());
      claims.put(JwtClaimNames.EXP, expiresAt);
      if (decoded.getIssuedAtAsInstant() != null) {
        claims.put(JwtClaimNames.IAT, decoded.getIssuedAtAsInstant());
      }
      if (decoded.getNotBeforeAsInstant() != null) {
        claims.put(JwtClaimNames.NBF, decoded.getNotBeforeAsInstant());
      }
      if (decoded.getId() != null) {
        claims.put(JwtClaimNames.JTI, decoded.getId());
      }
      return new Jwt(token, decoded.getIssuedAtAsInstant(), expiresAt, headers, claims);
    } catch (JWTVerificationException | IllegalArgumentException exception) {
      throw new BadJwtException("JWT inválido.", exception);
    }
  }

  private static boolean isValidSubject(String subject) {
    if (subject == null || !subject.matches("[1-9][0-9]*")) {
      return false;
    }

    try {
      Long.parseLong(subject);
      return true;
    } catch (NumberFormatException exception) {
      return false;
    }
  }
}
