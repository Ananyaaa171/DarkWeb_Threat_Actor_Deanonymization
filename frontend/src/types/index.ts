export interface ActorSummary {
  id: string;
  canonicalName: string;
  threatCategory: string;
  primaryMotive: string;
  status: string;
  overallConfidenceScore: number;
  personaCount: number;
  associatedHandles: string[];
  lastObservedAt: string | null;
}

export interface PersonaSummary {
  id: string;
  handle: string;
  platform: string;
  status: string;
  reputationScore: number;
  activityTimezoneEstimated: string | null;
  identifierCount: number;
  infrastructureCount: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface Identifier {
  id: string;
  type: string;
  value: string;
  metadata: string | null;
  isVerified: boolean;
  firstSeenAt: string | null;
}

export interface Infrastructure {
  id: string;
  type: string;
  value: string;
  ipAddress: string | null;
  asn: string | null;
  sslCertFingerprint: string | null;
  isLive: boolean;
  lastScannedAt: string | null;
}

export interface StylometricSample {
  id: string;
  sampleTitle: string;
  rawText: string;
  tokenCount: number;
  lexicalMetrics: string | null;
  collectedAt: string | null;
}

export interface TimelineEvent {
  id: string;
  personaId: string | null;
  personaHandle: string | null;
  actorCanonicalName: string | null;
  eventType: string;
  title: string;
  description: string;
  sourceReference: string | null;
  eventTimestamp: string;
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ActorDetail {
  id: string;
  canonicalName: string;
  threatCategory: string;
  primaryMotive: string;
  status: string;
  overallConfidenceScore: number;
  summary: string;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
  personas: PersonaSummary[];
  identifiers: Identifier[];
  infrastructure: Infrastructure[];
  recentTimeline: TimelineEvent[];
}

export interface PersonaDetail {
  id: string;
  actorId: string | null;
  actorCanonicalName: string | null;
  handle: string;
  platform: string;
  reputationScore: number;
  status: string;
  activityTimezoneEstimated: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  identifiers: Identifier[];
  infrastructure: Infrastructure[];
  stylometricSamples: StylometricSample[];
  timelineEvents: TimelineEvent[];
}

export interface SearchResult {
  resultType: 'ACTOR' | 'PERSONA' | 'IDENTIFIER' | 'INFRASTRUCTURE';
  entityId: string;
  displayName: string;
  actorName: string | null;
  handle: string | null;
  category: string | null;
  confidenceScore: number | null;
  lastObservedAt: string | null;
  metadataSnippet: string | null;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'ACTOR' | 'PERSONA' | 'IDENTIFIER' | 'INFRASTRUCTURE';
  subType: string | null;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'CONTROLS' | 'USES_IDENTIFIER' | 'OPERATES_INFRASTRUCTURE' | 'MIGRATED_TO';
  confidence: number | null;
  data: Record<string, any>;
}

export interface RelationshipGraph {
  actorId: string;
  actorName: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EvidenceItem {
  id: string;
  factorCategory: 'IDENTIFIER' | 'STYLOMETRY' | 'BEHAVIOR' | 'INFRASTRUCTURE';
  title: string;
  contributionPoints: number;
  details: string;
  evidenceSnippet: string | null;
  source: string | null;
  sourceReliability: string | null;
  observedAt: string | null;
}

export interface LinkageAnalysis {
  id: string;
  sourcePersonaId: string;
  sourcePersonaHandle: string;
  sourcePersonaPlatform: string;
  targetPersonaId: string;
  targetPersonaHandle: string;
  targetPersonaPlatform: string;
  attributionScore: number;
  confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  identifierScore: number;
  stylometricScore: number;
  behavioralScore: number;
  infrastructureScore: number;
  aiExplanationSummary: string | null;
  analystReviewStatus: string;
  computedAt: string;
  evidenceItems: EvidenceItem[];
}

export interface StylometricFeatures {
  ttr: number;
  yulesK: number;
  avgSentenceLength: number;
  avgWordLength: number;
  punctuationFrequency: number;
  functionWordRatio: number;
  smileyPatternFrequency: number;
  totalTokens: number;
  uniqueTokens: number;
  totalSentences: number;
}

export interface StylometricComparison {
  sourcePersonaId: string | null;
  targetPersonaId: string | null;
  sourceFeatures: StylometricFeatures;
  targetFeatures: StylometricFeatures;
  ttrSimilarity: number;
  yulesKSimilarity: number;
  charTrigramSimilarity: number;
  punctuationSimilarity: number;
  sentenceLengthSimilarity: number;
  wordLengthSimilarity: number;
  smileySimilarity: number;
  functionWordSimilarity: number;
  overallStylometricScore: number;
  analysisDetails: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardStats {
  totalThreatActors: number;
  trackedPersonas: number;
  activeInvestigations: number;
  highConfidenceLinkages: number;
  monitoredIdentifiers: number;
  activeInfrastructure: number;
  categoryDistribution: Record<string, number>;
}

