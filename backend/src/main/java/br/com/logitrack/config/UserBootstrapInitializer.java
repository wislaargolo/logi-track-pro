package br.com.logitrack.config;

import br.com.logitrack.service.user.UserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class UserBootstrapInitializer implements ApplicationRunner {
  private final AuthProperties.Bootstrap properties;
  private final UserService userService;

  public UserBootstrapInitializer(AuthProperties properties, UserService userService) {
    this.properties = properties.bootstrap();
    this.userService = userService;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (properties.enabled()) {
      userService.initializeUser(properties.name(), properties.email(), properties.password());
    }
  }
}
