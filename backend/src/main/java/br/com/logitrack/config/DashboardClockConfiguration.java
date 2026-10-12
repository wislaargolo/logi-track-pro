package br.com.logitrack.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DashboardClockConfiguration {

  @Bean
  Clock dashboardClock() {
    return Clock.systemDefaultZone();
  }
}
