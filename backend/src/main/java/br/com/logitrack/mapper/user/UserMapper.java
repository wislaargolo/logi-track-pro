package br.com.logitrack.mapper.user;

import br.com.logitrack.dto.user.UserDto;
import br.com.logitrack.entity.user.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public UserDto toDto(UserEntity entity) {
    return new UserDto(entity.getId(), entity.getName(), entity.getEmail());
  }
}
