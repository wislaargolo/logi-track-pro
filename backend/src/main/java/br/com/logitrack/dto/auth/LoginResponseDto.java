package br.com.logitrack.dto.auth;

import br.com.logitrack.dto.user.UserDto;

public record LoginResponseDto(String accessToken, UserDto user) {}
