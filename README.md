# Dark Web Deanonymizer
**Threat Actor Intelligence & Persona Attribution Platform (Smart India Hackathon)**

---

## Overview
The **Dark Web Deanonymizer** is an authorized cyber threat intelligence (CTI) and attribution platform designed for law enforcement agencies (LEAs), CERTs, and security analysts. It enables automated ingestion of open-source threat data, cross-persona correlation, statistical stylometric profiling, deterministic multi-factor attribution scoring, and interactive visualization of darknet threat networks.

Refer to [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) for the full architectural specification.

---

## 1. Prerequisites

Make sure the following tools are installed on your workstation:

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Java JDK**: Version 17 or higher
- **Apache Maven**: Version 3.8 or higher (or use Maven wrapper)
- **Supabase / PostgreSQL**: Supabase account or local PostgreSQL 15+ instance

---

## 2. Supabase PostgreSQL Configuration

### Step A: Initialize Schema
1. Open your **Supabase Dashboard** (or local PostgreSQL client such as pgAdmin / DBeaver).
2. Open the **SQL Editor**.
3. Copy and run the contents of [`database/schema.sql`](./database/schema.sql).
   - This creates all 8 MVP core tables: `threat_actors`, `personas`, `identifiers`, `infrastructure`, `stylometric_samples`, `linkage_analysis`, `evidence_items`, and `timeline_events`.
   - It also enables required extensions (`uuid-ossp`, `pg_trgm`) and creates performance indexes.

### Step B: Load Demonstration Dataset
1. In the Supabase **SQL Editor**, copy and run the contents of [`database/seed_data.sql`](./database/seed_data.sql).
   - This populates a realistic, synthetic research dataset (LockBit / Bassterlord, ShinyHunters, ALPHV) demonstrating cross-forum persona migrations, shared PGP/wallet indicators, and timeline events.

---

## 3. Environment Variables

Create a `.env` file or export the following variables in your terminal:

```bash
# =============================================================================
# Database Configuration (Supabase PostgreSQL Connection Pooler URI)
# =============================================================================
SPRING_DATASOURCE_URL=jdbc:postgresql://db.xxxxxx.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_supabase_database_password

# =============================================================================
# Google Gemini AI Configuration (Google AI Studio)
# =============================================================================
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL_NAME=gemini-1.5-flash        # Configurable LLM for semantic explanations
GEMINI_EMBEDDING_MODEL=text-embedding-004 # Configurable model for vector embeddings

# =============================================================================
# Frontend API Base URL
# =============================================================================
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 4. How to Run the Backend (Spring Boot)

```bash
# Navigate to the backend directory
cd backend

# Compile and run unit tests (uses in-memory H2 database for isolated testing)
mvn clean test

# Run the Spring Boot development server (port 8080)
mvn spring-boot:run
```

Once running, verify the backend health endpoint in your browser or curl:
```bash
curl http://localhost:8080/api/v1/health
```

---

## 5. How to Run the Frontend (Next.js)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Project Directory Layout

```
dark-web-deanonymizer/
├── frontend/                          # Next.js 14 / React Frontend (App Router, TypeScript)
│   ├── src/
│   │   ├── app/                       # MVP Pages (Login, Dashboard, Search, Graph, Timeline, etc.)
│   │   ├── components/                # Reusable UI & Visualization Components
│   │   ├── lib/                       # API client & helpers
│   │   └── types/                     # Core TypeScript Data Interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                           # Java 17 + Spring Boot 3.3.3 Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sih/deanonymizer/
│   │   │   │   ├── config/            # CorsConfig, SecurityConfig
│   │   │   │   ├── controller/        # REST API Controllers
│   │   │   │   ├── model/entity/      # JPA Entities (ThreatActor, Persona, etc.)
│   │   │   │   └── repository/        # Spring Data JPA Repositories
│   │   │   └── resources/
│   │   │       └── application.yml    # Configuration & ENV bindings
│   │   └── test/                      # Unit & integration tests
│   └── pom.xml
│
├── database/                          # Supabase PostgreSQL Layer
│   ├── schema.sql                     # MVP 8 tables DDL + indexes
│   └── seed_data.sql                  # Realistic demonstration dataset
│
├── docs/                              # Project documentation & SIH assets
├── PROJECT_BLUEPRINT.md               # Master Technical Blueprint
└── README.md                          # Getting Started Guide (This file)
```

---

## 7. Next Steps (Development Roadmap)

- **Phase 1**: Project Setup + Supabase Database Layer ✅ (*Completed*)
- **Phase 2**: Spring Boot Core REST APIs & Data Ingestion Pipeline (*Upcoming*)
- **Phase 3**: Statistical Stylometry NLP + Deterministic Scoring + Configurable Gemini Explanation Engine
- **Phase 4**: Next.js Cyber UI (8 Essential Pages)
- **Phase 5**: Full Integration & End-to-End Investigation Flow
- **Phase 6**: PDF Intelligence Dossier Generator + Autonomous Feed Sync + Audit
- **Phase 7**: End-to-End Testing & SIH Presentation Polish
