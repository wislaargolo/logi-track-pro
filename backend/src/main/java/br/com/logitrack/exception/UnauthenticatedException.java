package br.com.logitrack.exception;

public class UnauthenticatedException extends RuntimeException {
  public UnauthenticatedException() {
    super("Não autenticado.");
  }
}
