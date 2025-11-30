package com.school.ecommerce.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class JwtSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http)) // enable CORS

                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 🔥 allow every endpoint for now
                )

                .httpBasic(Customizer.withDefaults())
                .formLogin(form -> form.disable()); // disable login redirect 403

        return http.build();
    }

    // Needed for UserServiceImpl (fixes your startup error)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
