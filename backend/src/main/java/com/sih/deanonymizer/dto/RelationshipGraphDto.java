package com.sih.deanonymizer.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RelationshipGraphDto {

    private List<GraphNodeDto> nodes = new ArrayList<>();
    private List<GraphEdgeDto> edges = new ArrayList<>();

    public RelationshipGraphDto() {}

    public RelationshipGraphDto(List<GraphNodeDto> nodes, List<GraphEdgeDto> edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    public List<GraphNodeDto> getNodes() { return nodes; }
    public void setNodes(List<GraphNodeDto> nodes) { this.nodes = nodes; }

    public List<GraphEdgeDto> getEdges() { return edges; }
    public void setEdges(List<GraphEdgeDto> edges) { this.edges = edges; }

    public static class GraphNodeDto {
        private String id;
        private String type; // ACTOR, PERSONA, IDENTIFIER, INFRASTRUCTURE, BREACH
        private String label;
        private String category;
        private Map<String, Object> data = new HashMap<>();

        public GraphNodeDto() {}

        public GraphNodeDto(String id, String type, String label, String category) {
            this.id = id;
            this.type = type;
            this.label = label;
            this.category = category;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
    }

    public static class GraphEdgeDto {
        private String id;
        private String source;
        private String target;
        private String relationship; // CONTROLS, USES_IDENTIFIER, OPERATES_INFRASTRUCTURE, MIGRATED_TO
        private BigDecimal confidence;
        private String label;

        public GraphEdgeDto() {}

        public GraphEdgeDto(String id, String source, String target, String relationship, BigDecimal confidence, String label) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.relationship = relationship;
            this.confidence = confidence;
            this.label = label;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }

        public BigDecimal getConfidence() { return confidence; }
        public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }
}
