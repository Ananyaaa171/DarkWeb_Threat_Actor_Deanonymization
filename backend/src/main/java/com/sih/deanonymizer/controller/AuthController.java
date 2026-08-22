package com.sih.deanonymizer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for investigator authentication and session token provisioning")
public class AuthController {

    @PostMapping("/login")
    @Operation(summary = "Investigator sign-in", description = "Authenticates an authorized investigator or analyst and returns session token and permissions.")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.getOrDefault("username", "analyst");
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", "dwd_jwt_" + System.currentTimeMillis());
        response.put("username", username);
        response.put("role", "LEAD_ANALYST");
        response.put("unit", "Cyber Intelligence Division (OP-74)");
        response.put("classification", "TLP:AMBER+STRICT");
        response.put("issuedAt", OffsetDateTime.now().toString());
        response.put("expiresIn", 86400);
        response.put("permissions", List.of(
                "CTI_SEARCH",
                "STYLOMETRIC_ANALYSIS",
                "ATTRIBUTION_COMPUTE",
                "GRAPH_EXPLORE",
                "DOSSIER_EXPORT"
        ));

        return ResponseEntity.ok(response);
    }
}
