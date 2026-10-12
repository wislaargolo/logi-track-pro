package br.com.logitrack.service.auth;

import br.com.logitrack.dto.auth.LoginRequestDto;
import br.com.logitrack.dto.auth.LoginResponseDto;
import br.com.logitrack.dto.user.UserDto;
import br.com.logitrack.entity.user.UserEntity;
import br.com.logitrack.mapper.user.UserMapper;
import br.com.logitrack.service.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserService userService;
  private final AuthenticationManager authenticationManager;
  private final TokenService tokenService;
  private final UserMapper userMapper;

  public AuthService(
      UserService userService,
      AuthenticationManager authenticationManager,
      TokenService tokenService,
      UserMapper userMapper) {
    this.userService = userService;
    this.authenticationManager = authenticationManager;
    this.tokenService = tokenService;
    this.userMapper = userMapper;
  }

  public LoginResponseDto login(LoginRequestDto request) {
    UserEntity user =
        (UserEntity)
            authenticationManager
                .authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                        request.email(), request.password()))
                .getPrincipal();

    return new LoginResponseDto(tokenService.generateToken(user.getId()), userMapper.toDto(user));
  }

  public UserDto findCurrentUser(Long userId) {
    return userMapper.toDto(userService.findCurrentUser(userId));
  }
}
