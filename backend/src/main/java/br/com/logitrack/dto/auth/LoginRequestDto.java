package br.com.logitrack.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDto(
    @NotBlank(message = "email é obrigatório.")
        @Email(message = "email deve ter formato válido.")
        @Size(max = 254, message = "email deve conter no máximo 254 caracteres.")
        String email,
    @NotBlank(message = "password é obrigatório.") String password) {}
