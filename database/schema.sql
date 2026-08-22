-- ============================================================================
-- Dark Web Deanonymizer — PostgreSQL Database Schema
-- Compatible with Supabase PostgreSQL 15+ / Standard PostgreSQL 15+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. Table: threat_actors
-- Master record representing an identified threat group or consolidated actor.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threat_actors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(100) NOT NULL UNIQUE,
    threat_category VARCHAR(50) NOT NULL, -- e.g. RANSOMWARE, INITIAL_ACCESS, DATA_BROKER, CARDING, HACKTIVISM
    primary_motive VARCHAR(50) DEFAULT 'FINANCIAL', -- e.g. FINANCIAL, ESPIONAGE, HACKTIVISM, SABOTAGE
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, DORMANT, DISRUPTED, ARRESTED, UNKNOWN
    overall_confidence_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 100),
    summary TEXT,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. Table: personas
-- Online handles and forum identities operated across platforms.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES threat_actors(id) ON DELETE SET NULL,
    handle VARCHAR(100) NOT NULL,
    platform VARCHAR(100) NOT NULL, -- e.g. XSS.is, Exploit.in, Breached, Telegram, Dread, Ramp
    profile_url VARCHAR(500),
    reputation_score NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, BANNED, MIGRATED, DORMANT, UNKNOWN
    activity_timezone_estimated VARCHAR(50), -- e.g. UTC+3 (MSK), UTC+8, UTC-5
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_persona_handle_platform UNIQUE (handle, platform)
);

-- ----------------------------------------------------------------------------
-- 3. Table: identifiers
-- Digital fingerprints associated with a persona (Crypto wallets, PGP, Tox, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- PGP_FINGERPRINT, PGP_KEY_ID, BTC_WALLET, XMR_WALLET, ETH_WALLET, EMAIL, TOX_ID, TELEGRAM_HANDLE, JABBER_ID
    value TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g. {"currency": "BTC", "tx_count": 34, "total_received": 12.8, "key_id": "0x4A72B5C1"}
    is_verified BOOLEAN DEFAULT false,
    first_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. Table: infrastructure
-- Dark web hidden services, leak sites, C2 servers, and mirrors.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS infrastructure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- ONION_V3, CLEARSIGNAL_MIRROR, C2_SERVER, TELEGRAM_CHANNEL, HOSTING_IP
    value VARCHAR(500) NOT NULL, -- e.g. http://lockbit7...onion or IP address
    ip_address VARCHAR(45),
    asn VARCHAR(100),
    ssl_cert_fingerprint VARCHAR(128),
    is_live BOOLEAN DEFAULT true,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. Table: stylometric_samples
-- Text excerpts (forum posts, ransom notes, statements) authored by a persona.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stylometric_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    sample_title VARCHAR(200) NOT NULL,
    raw_text TEXT NOT NULL,
    clean_text TEXT,
    token_count INT DEFAULT 0,
    lexical_metrics JSONB DEFAULT '{}'::jsonb, -- {"ttr": 0.64, "yules_k": 44.2, "avg_sentence_len": 16.5, "punctuation_rate": 0.09}
    collected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. Table: linkage_analysis
-- Computed potential linkages between two personas with deterministic scores.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkage_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    target_persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    attribution_score NUMERIC(5, 2) NOT NULL CHECK (attribution_score >= 0 AND attribution_score <= 100),
    confidence_level VARCHAR(20) NOT NULL, -- HIGH (>=85%), MODERATE (65-84%), LOW (40-64%), INSUFFICIENT (<40%)
    identifier_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (identifier_score >= 0 AND identifier_score <= 100),
    stylometric_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (stylometric_score >= 0 AND stylometric_score <= 100),
    behavioral_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (behavioral_score >= 0 AND behavioral_score <= 100),
    infrastructure_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
    ai_explanation_summary TEXT, -- Natural-language explanation generated by Gemini AI
    analyst_review_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, CONFIRMED, REJECTED
    computed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_persona_linkage_pair UNIQUE (source_persona_id, target_persona_id)
);

-- ----------------------------------------------------------------------------
-- 7. Table: evidence_items
-- Individual substantiate evidence points contributing to a linkage analysis.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkage_id UUID NOT NULL REFERENCES linkage_analysis(id) ON DELETE CASCADE,
    factor_category VARCHAR(50) NOT NULL, -- IDENTIFIER, STYLOMETRY, BEHAVIOR, INFRASTRUCTURE
    title VARCHAR(255) NOT NULL,
    contribution_points NUMERIC(5, 2) DEFAULT 0.00,
    details TEXT,
    evidence_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. Table: timeline_events
-- Chronological event log of observed threat actor and persona activities.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- FORUM_POST, BREACH_ANNOUNCED, WALLET_PAYMENT, INFRA_ONLINE, KEY_ROTATION, PERSONA_MIGRATION
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_timestamp TIMESTAMPTZ NOT NULL,
    source_reference VARCHAR(500),
    severity VARCHAR(20) DEFAULT 'INFO', -- INFO, LOW, MEDIUM, HIGH, CRITICAL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for High-Performance Queries & Full-Text Searching
-- ============================================================================

-- Persona searches
CREATE INDEX IF NOT EXISTS idx_personas_handle_lower ON personas (LOWER(handle));
CREATE INDEX IF NOT EXISTS idx_personas_platform ON personas (platform);
CREATE INDEX IF NOT EXISTS idx_personas_actor_id ON personas (actor_id);
CREATE INDEX IF NOT EXISTS idx_personas_status ON personas (status);

-- Identifier lookups (exact match and type filters)
CREATE INDEX IF NOT EXISTS idx_identifiers_value ON identifiers (value);
CREATE INDEX IF NOT EXISTS idx_identifiers_type_value ON identifiers (type, value);
CREATE INDEX IF NOT EXISTS idx_identifiers_persona_id ON identifiers (persona_id);

-- Infrastructure lookups
CREATE INDEX IF NOT EXISTS idx_infrastructure_value ON infrastructure (value);
CREATE INDEX IF NOT EXISTS idx_infrastructure_type ON infrastructure (type);
CREATE INDEX IF NOT EXISTS idx_infrastructure_persona_id ON infrastructure (persona_id);

-- Timeline chronological lookups
CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON timeline_events (event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_persona_id ON timeline_events (persona_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event_type ON timeline_events (event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_severity ON timeline_events (severity);

-- Linkage & Attribution lookups
CREATE INDEX IF NOT EXISTS idx_linkage_source_target ON linkage_analysis (source_persona_id, target_persona_id);
CREATE INDEX IF NOT EXISTS idx_linkage_score ON linkage_analysis (attribution_score DESC);
CREATE INDEX IF NOT EXISTS idx_linkage_confidence ON linkage_analysis (confidence_level);
CREATE INDEX IF NOT EXISTS idx_evidence_linkage_id ON evidence_items (linkage_id);

-- Stylometric samples
CREATE INDEX IF NOT EXISTS idx_stylometric_persona_id ON stylometric_samples (persona_id);

-- Threat Actor search
CREATE INDEX IF NOT EXISTS idx_threat_actors_canonical_lower ON threat_actors (LOWER(canonical_name));
CREATE INDEX IF NOT EXISTS idx_threat_actors_category ON threat_actors (threat_category);
CREATE INDEX IF NOT EXISTS idx_threat_actors_status ON threat_actors (status);

-- Trigram fuzzy indexes for search bar autocomplete & typo tolerance
CREATE INDEX IF NOT EXISTS idx_personas_handle_trgm ON personas USING gin (handle gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_threat_actors_name_trgm ON threat_actors USING gin (canonical_name gin_trgm_ops);
