package com.sih.deanonymizer.controller;

import com.sih.deanonymizer.dto.PersonaDetailDto;
import com.sih.deanonymizer.service.PersonaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/personas")
@Tag(name = "Personas", description = "Endpoints for dark web persona sub-profiles, digital fingerprints, and stylometric samples")
public class PersonaController {

    private final PersonaService personaService;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get persona profile", description = "Retrieves full details for a persona including associated threat group, PGP/crypto identifiers, infrastructure, and timeline events.")
    public ResponseEntity<PersonaDetailDto> getPersonaById(
            @Parameter(description = "UUID of the persona")
            @PathVariable UUID id
    ) {
        PersonaDetailDto persona = personaService.getPersonaById(id);
        return ResponseEntity.ok(persona);
    }
}
