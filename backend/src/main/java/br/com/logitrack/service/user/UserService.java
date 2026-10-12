package br.com.logitrack.service.user;

import br.com.logitrack.entity.user.UserEntity;
import br.com.logitrack.exception.UnauthenticatedException;
import br.com.logitrack.repository.user.UserRepository;
import java.util.Locale;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return userRepository
        .findByEmail(normalizeEmail(username))
        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));
  }

  public UserEntity findCurrentUser(Long userId) {
    if (userId == null || userId <= 0) {
      throw new UnauthenticatedException();
    }

    return userRepository.findById(userId).orElseThrow(UnauthenticatedException::new);
  }

  @Transactional
  public void initializeUser(String name, String email, String password) {
    String normalizedEmail = normalizeEmail(email);

    if (!userRepository.existsByEmail(normalizedEmail)) {
      userRepository.save(new UserEntity(name, normalizedEmail, passwordEncoder.encode(password)));
    }
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }
}
