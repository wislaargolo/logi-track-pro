package br.com.logitrack.config;

import br.com.logitrack.exception.handler.SecurityProblemHandlers;
import br.com.logitrack.utils.JwtUtils;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.JWTVerifier;
import java.util.Base64;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(
      UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);

    return new ProviderManager(provider);
  }

  @Bean
  Algorithm jwtAlgorithm(AuthProperties properties) {
    return Algorithm.HMAC256(Base64.getDecoder().decode(properties.jwt().secret()));
  }

  @Bean
  JwtDecoder jwtDecoder(AuthProperties properties, Algorithm jwtAlgorithm) {
    JWTVerifier verifier =
        JWT.require(jwtAlgorithm)
            .withIssuer(properties.jwt().issuer())
            .withAudience(properties.jwt().audience())
            .withClaimPresence(JwtClaimNames.EXP)
            .acceptLeeway(properties.jwt().clockSkew().toSeconds())
            .build();

    return token -> JwtUtils.decode(token, verifier);
  }

  @Bean
  RequestMatcher publicEndpoints() {
    return new OrRequestMatcher(
        PathPatternRequestMatcher.pathPattern(HttpMethod.POST, "/api/v1/auth/login"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/actuator/health"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/actuator/health/liveness"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/actuator/health/readiness"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/swagger-ui.html"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/swagger-ui/**"),
        PathPatternRequestMatcher.pathPattern(HttpMethod.GET, "/v3/api-docs/**"));
  }

  @Bean
  BearerTokenResolver bearerTokenResolver(RequestMatcher publicEndpoints) {
    DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
    return request -> publicEndpoints.matches(request) ? null : delegate.resolve(request);
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      RequestMatcher publicEndpoints,
      BearerTokenResolver bearerTokenResolver,
      SecurityProblemHandlers handlers)
      throws Exception {
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .requestCache(requestCache -> requestCache.disable())
        .formLogin(formLogin -> formLogin.disable())
        .httpBasic(httpBasic -> httpBasic.disable())
        .logout(logout -> logout.disable())
        .exceptionHandling(
            exceptions ->
                exceptions.authenticationEntryPoint(handlers).accessDeniedHandler(handlers))
        .authorizeHttpRequests(
            authorize ->
                authorize.requestMatchers(publicEndpoints).permitAll().anyRequest().authenticated())
        .oauth2ResourceServer(
            resourceServer ->
                resourceServer
                    .bearerTokenResolver(bearerTokenResolver)
                    .jwt(Customizer.withDefaults()));

    return http.build();
  }
}
