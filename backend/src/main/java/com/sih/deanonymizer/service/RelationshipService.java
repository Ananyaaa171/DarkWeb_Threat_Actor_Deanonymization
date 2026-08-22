package com.sih.deanonymizer.service;

import com.sih.deanonymizer.dto.RelationshipGraphDto;
import com.sih.deanonymizer.dto.RelationshipGraphDto.GraphEdgeDto;
import com.sih.deanonymizer.dto.RelationshipGraphDto.GraphNodeDto;
import com.sih.deanonymizer.exception.ResourceNotFoundException;
import com.sih.deanonymizer.model.entity.*;
import com.sih.deanonymizer.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RelationshipService {

    private final ThreatActorRepository actorRepository;
    private final PersonaRepository personaRepository;
    private final IdentifierRepository identifierRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final LinkageAnalysisRepository linkageAnalysisRepository;

    public RelationshipService(
            ThreatActorRepository actorRepository,
            PersonaRepository personaRepository,
            IdentifierRepository identifierRepository,
            InfrastructureRepository infrastructureRepository,
            LinkageAnalysisRepository linkageAnalysisRepository) {
        this.actorRepository = actorRepository;
        this.personaRepository = personaRepository;
        this.identifierRepository = identifierRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.linkageAnalysisRepository = linkageAnalysisRepository;
    }

    public RelationshipGraphDto getActorRelationships(UUID actorId) {
        ThreatActor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Threat Actor", actorId));

        List<GraphNodeDto> nodes = new ArrayList<>();
        List<GraphEdgeDto> edges = new ArrayList<>();
        Set<String> addedNodeIds = new HashSet<>();

        // 1. Actor Node
        String actorNodeId = "actor_" + actor.getId();
        GraphNodeDto actorNode = new GraphNodeDto(actorNodeId, "ACTOR", actor.getCanonicalName(), actor.getThreatCategory());
        actorNode.getData().put("confidenceScore", actor.getOverallConfidenceScore());
        actorNode.getData().put("status", actor.getStatus());
        actorNode.getData().put("motive", actor.getPrimaryMotive());
        nodes.add(actorNode);
        addedNodeIds.add(actorNodeId);

        // 2. Persona Nodes & Actor->Persona Edges
        List<Persona> personas = personaRepository.findByActorId(actorId);
        List<UUID> personaIds = personas.stream().map(Persona::getId).collect(Collectors.toList());

        for (Persona persona : personas) {
            String personaNodeId = "persona_" + persona.getId();
            if (addedNodeIds.add(personaNodeId)) {
                GraphNodeDto personaNode = new GraphNodeDto(
                        personaNodeId,
                        "PERSONA",
                        persona.getHandle() + " (" + persona.getPlatform() + ")",
                        persona.getPlatform()
                );
                personaNode.getData().put("handle", persona.getHandle());
                personaNode.getData().put("platform", persona.getPlatform());
                personaNode.getData().put("status", persona.getStatus());
                personaNode.getData().put("timezone", persona.getActivityTimezoneEstimated());
                personaNode.getData().put("reputation", persona.getReputationScore());
                nodes.add(personaNode);
            }

            // Edge from Actor to Persona
            BigDecimal actorConfidence = actor.getOverallConfidenceScore() != null ?
                    actor.getOverallConfidenceScore().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP) : BigDecimal.ONE;

            edges.add(new GraphEdgeDto(
                    "edge_actor_persona_" + persona.getId(),
                    actorNodeId,
                    personaNodeId,
                    "CONTROLS",
                    actorConfidence,
                    "Controls Identity"
            ));
        }

        // 3. Identifier Nodes & Persona->Identifier Edges
        if (!personaIds.isEmpty()) {
            List<Identifier> identifiers = identifierRepository.findByPersonaIdIn(personaIds);
            for (Identifier id : identifiers) {
                String idNodeId = "identifier_" + id.getId();
                if (addedNodeIds.add(idNodeId)) {
                    GraphNodeDto idNode = new GraphNodeDto(idNodeId, "IDENTIFIER", id.getValue(), id.getType());
                    idNode.getData().put("type", id.getType());
                    idNode.getData().put("isVerified", id.getIsVerified());
                    nodes.add(idNode);
                }

                if (id.getPersona() != null) {
                    String personaNodeId = "persona_" + id.getPersona().getId();
                    edges.add(new GraphEdgeDto(
                            "edge_persona_id_" + id.getId(),
                            personaNodeId,
                            idNodeId,
                            "USES_IDENTIFIER",
                            BigDecimal.ONE,
                            "Publishes " + id.getType()
                    ));
                }
            }

            // 4. Infrastructure Nodes & Persona->Infrastructure Edges
            List<Infrastructure> infrastructureList = infrastructureRepository.findByPersonaIdIn(personaIds);
            for (Infrastructure infra : infrastructureList) {
                String infraNodeId = "infra_" + infra.getId();
                if (addedNodeIds.add(infraNodeId)) {
                    GraphNodeDto infraNode = new GraphNodeDto(infraNodeId, "INFRASTRUCTURE", infra.getValue(), infra.getType());
                    infraNode.getData().put("type", infra.getType());
                    infraNode.getData().put("ipAddress", infra.getIpAddress());
                    infraNode.getData().put("asn", infra.getAsn());
                    infraNode.getData().put("isLive", infra.getIsLive());
                    nodes.add(infraNode);
                }

                if (infra.getPersona() != null) {
                    String personaNodeId = "persona_" + infra.getPersona().getId();
                    edges.add(new GraphEdgeDto(
                            "edge_persona_infra_" + infra.getId(),
                            personaNodeId,
                            infraNodeId,
                            "OPERATES_INFRASTRUCTURE",
                            new BigDecimal("0.90"),
                            "Directs Service"
                    ));
                }
            }

            // 5. Cross-Persona Linkage Edges
            List<LinkageAnalysis> linkages = linkageAnalysisRepository.findBySourcePersonaIdInOrTargetPersonaIdIn(personaIds, personaIds);
            for (LinkageAnalysis link : linkages) {
                String sourceNodeId = "persona_" + link.getSourcePersona().getId();
                String targetNodeId = "persona_" + link.getTargetPersona().getId();

                BigDecimal linkConfidence = link.getAttributionScore() != null ?
                        link.getAttributionScore().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                edges.add(new GraphEdgeDto(
                        "edge_linkage_" + link.getId(),
                        sourceNodeId,
                        targetNodeId,
                        "MIGRATED_TO",
                        linkConfidence,
                        "Attributed Migration (" + link.getAttributionScore() + "%)"
                ));
            }
        }

        return new RelationshipGraphDto(nodes, edges);
    }
}
