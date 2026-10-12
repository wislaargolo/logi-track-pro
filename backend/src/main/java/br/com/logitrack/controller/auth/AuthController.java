package br.com.logitrack.controller.auth;

import br.com.logitrack.dto.auth.LoginRequestDto;
import br.com.logitrack.dto.auth.LoginResponseDto;
import br.com.logitrack.dto.user.UserDto;
import br.com.logitrack.service.auth.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Login e identidade do usuário atual")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  @SecurityRequirements
  public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(authService.login(request));
  }

  @GetMapping("/me")
  @SecurityRequirement(name = "bearerAuth")
  public ResponseEntity<UserDto> me(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(authService.findCurrentUser(Long.valueOf(jwt.getSubject())));
  }
}
