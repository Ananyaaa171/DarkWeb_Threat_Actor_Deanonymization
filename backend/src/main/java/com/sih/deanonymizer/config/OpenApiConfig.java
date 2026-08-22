package com.sih.deanonymizer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Dark Web Deanonymizer — CTI & Attribution API")
                        .version("1.0.0")
                        .description("REST API for Threat Actor Intelligence, Cross-Forum Persona Linkage, and Deterministic Attribution Analysis.")
                        .contact(new Contact()
                                .name("SIH Cyber Intelligence Team")
                                .email("team@sih-deanonymizer.gov.in"))
                        .license(new License()
                                .name("Authorized Academic & Law Enforcement Evaluation License")
                                .url("https://sih.gov.in")));
    }
}
