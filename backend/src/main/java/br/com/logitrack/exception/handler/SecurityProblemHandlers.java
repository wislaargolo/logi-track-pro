package br.com.logitrack.exception.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class SecurityProblemHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

  private final ObjectMapper objectMapper;

  public SecurityProblemHandlers(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
      throws IOException {
    write(response, HttpServletResponse.SC_UNAUTHORIZED, "Token ausente ou inválido.");
  }

  @Override
  public void handle(
      HttpServletRequest request, HttpServletResponse response, AccessDeniedException exception)
      throws IOException {
    write(response, HttpServletResponse.SC_FORBIDDEN, "Acesso negado.");
  }

  private void write(HttpServletResponse response, int status, String detail) throws IOException {
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setHeader("Cache-Control", "no-store");

    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(status), detail);
    problem.setTitle(
        status == HttpStatus.UNAUTHORIZED.value() ? "Falha de autenticação" : "Acesso negado");

    objectMapper.writeValue(response.getWriter(), problem);
  }
}
