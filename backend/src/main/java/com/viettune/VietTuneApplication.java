package com.viettune;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class VietTuneApplication {

    public static void main(String[] args) {
        SpringApplication.run(VietTuneApplication.class, args);
    }

}
