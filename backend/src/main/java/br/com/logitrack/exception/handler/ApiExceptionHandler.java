package br.com.logitrack.exception.handler;

import br.com.logitrack.exception.BusinessException;
import br.com.logitrack.exception.ResourceNotFoundException;
import br.com.logitrack.exception.UnauthenticatedException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
  }

  @ExceptionHandler(BusinessException.class)
  public ProblemDetail handleBusinessException(BusinessException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ProblemDetail handleBadCredentials() {
    return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Credenciais inválidas.");
  }

  @ExceptionHandler(UnauthenticatedException.class)
  public ProblemDetail handleUnauthenticated() {
    return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Token ausente ou inválido.");
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "O parâmetro '" + exception.getName() + "' possui valor inválido.");
  }

  @Override
  protected ResponseEntity<Object> handleHttpMessageNotReadable(
      HttpMessageNotReadableException exception,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(status, "O corpo da requisição possui formato inválido.");

    problem.setTitle("Requisição inválida");

    return handleExceptionInternal(exception, problem, headers, status, request);
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException exception,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(status, "Um ou mais campos possuem valores inválidos.");

    problem.setTitle("Erro de validação");
    problem.setProperty("errors", validationErrors(exception));

    return handleExceptionInternal(exception, problem, headers, status, request);
  }

  @Override
  protected ResponseEntity<Object> handleHandlerMethodValidationException(
      HandlerMethodValidationException exception,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(status, "Um ou mais campos possuem valores inválidos.");

    problem.setTitle("Erro de validação");
    problem.setProperty("errors", validationErrors(exception));

    return handleExceptionInternal(exception, problem, headers, status, request);
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleUnexpectedException(Exception exception) {
    LOGGER.error("Erro inesperado ao processar a requisição", exception);

    return ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor.");
  }

  private List<Map<String, String>> validationErrors(HandlerMethodValidationException exception) {
    return exception.getParameterValidationResults().stream()
        .flatMap(
            result ->
                result.getResolvableErrors().stream()
                    .map(
                        error ->
                            Map.of(
                                "field", parameterName(result.getMethodParameter()),
                                "message",
                                    Objects.requireNonNullElse(
                                        error.getDefaultMessage(), "Valor inválido."))))
        .sorted(
            Comparator.comparing((Map<String, String> error) -> error.get("field"))
                .thenComparing(error -> error.get("message")))
        .toList();
  }

  private String parameterName(MethodParameter parameter) {
    RequestParam requestParam = parameter.getParameterAnnotation(RequestParam.class);
    if (requestParam != null && !requestParam.name().isEmpty()) {
      return requestParam.name();
    }

    if (requestParam != null && !requestParam.value().isEmpty()) {
      return requestParam.value();
    }

    return Objects.requireNonNullElse(parameter.getParameterName(), "parameter");
  }

  private List<Map<String, String>> validationErrors(MethodArgumentNotValidException exception) {
    return exception.getBindingResult().getFieldErrors().stream()
        .sorted(
            Comparator.comparing(FieldError::getField)
                .thenComparing(error -> Objects.requireNonNullElse(error.getDefaultMessage(), "")))
        .map(
            error ->
                Map.of(
                    "field", error.getField(),
                    "message",
                        Objects.requireNonNullElse(error.getDefaultMessage(), "Valor inválido.")))
        .toList();
  }
}
