package uk.telecom.o2c;

import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableProcessApplication("o2c-platform")
public class O2cApplication {
    public static void main(String[] args) {
        SpringApplication.run(O2cApplication.class, args);
    }
}
