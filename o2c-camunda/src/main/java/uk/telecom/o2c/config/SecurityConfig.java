package uk.telecom.o2c.config;

import org.camunda.bpm.webapp.impl.security.auth.ContainerBasedAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsManager(PasswordEncoder enc) {
        UserDetails admin = User.builder()
                .username("admin")
                .password(enc.encode("admin"))
                .roles("ADMIN", "USER")
                .build();
        UserDetails analyst = User.builder()
                .username("analyst")
                .password(enc.encode("analyst"))
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(admin, analyst);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                // Public static frontend assets
                .antMatchers("/", "/index.html", "/app.js", "/style.css", "/workflows.js",
                             "/h2-console/**", "/actuator/**").permitAll()
                // Camunda REST API — require basic auth
                .antMatchers("/engine-rest/**").authenticated()
                // Our custom API — require basic auth
                .antMatchers("/api/**").authenticated()
                // Camunda webapps
                .antMatchers("/camunda/**").authenticated()
                .anyRequest().authenticated()
            .and()
            .httpBasic()
            .and()
            .headers().frameOptions().sameOrigin(); // for H2 console
        return http.build();
    }

    @Bean
    public FilterRegistrationBean<ContainerBasedAuthenticationFilter> camundaAuthFilter() {
        FilterRegistrationBean<ContainerBasedAuthenticationFilter> reg = new FilterRegistrationBean<>();
        reg.setName("camunda-auth");
        reg.setFilter(new ContainerBasedAuthenticationFilter());
        reg.setInitParameters(Collections.singletonMap("authentication-provider",
                "org.camunda.bpm.engine.rest.security.auth.impl.HttpBasicAuthenticationProvider"));
        reg.setOrder(101);
        reg.addUrlPatterns("/engine-rest/*");
        return reg;
    }
}
