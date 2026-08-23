# Dark Web Threat Actor Deanonymization & Attribution Platform

A full-stack cyber threat intelligence platform designed to correlate dark-web personas, identifiers, behavioral patterns, stylometric characteristics, infrastructure, and evidence to assist analysts in investigating potential threat-actor relationships.

The platform combines a **Java Spring Boot backend**, **Next.js frontend**, deterministic attribution scoring, stylometric analysis, behavioral analysis, relationship graphs, timelines, evidence correlation, and Gemini-powered explanations.

---

## 🚀 Live Demo

**[Open the Live Application](https://darkweb-threat-actor-deanonymization.onrender.com)**

---

## 📌 Project Overview

Dark Web Threat Actor Deanonymization is an investigation-oriented platform that helps analysts correlate seemingly unrelated digital identities and infrastructure.

The system organizes intelligence around:

- Threat actors
- Dark-web personas
- Usernames and identifiers
- Stylometric characteristics
- Behavioral patterns
- Infrastructure
- Relationships
- Timeline events
- Evidence
- Linkage analysis
- Attribution confidence

Instead of relying on a single indicator, the platform combines multiple evidence dimensions to calculate a deterministic attribution score.

---

## 🎯 Objectives

The primary objectives of the platform are:

1. Correlate multiple dark-web personas with potential threat actors.
2. Analyze similarities in writing style and communication patterns.
3. Identify behavioral similarities across personas.
4. Correlate technical infrastructure and identifiers.
5. Build relationship graphs between entities.
6. Construct chronological investigation timelines.
7. Maintain traceable evidence for attribution decisions.
8. Generate deterministic attribution scores.
9. Provide AI-assisted explanations for complex linkage results.
10. Present intelligence through an analyst-friendly dashboard.

---

## 🧠 Attribution Architecture

The platform uses a deterministic four-factor attribution engine:

| Factor | Weight |
|---|---:|
| Identifier Similarity | 35% |
| Stylometric Similarity | 25% |
| Behavioral Similarity | 20% |
| Infrastructure Similarity | 20% |
| **Total** | **100%** |

The final attribution score is calculated from these independent evidence dimensions, providing a transparent scoring mechanism rather than relying exclusively on an AI-generated prediction.

---

## 🤖 AI Architecture

The platform integrates Google Gemini for AI-assisted explanation and semantic analysis.

### AI Components

- **Gemini Model:** Gemini 1.5 Flash
- **Embedding Model:** text-embedding-004
- **Attribution Engine:** Deterministic Java 4-Factor Engine

AI-generated explanations supplement the deterministic attribution engine and are intended to support analyst review.

---

## 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │        Analyst        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Next.js Frontend    │
                         │                       │
                         │  Login                │
                         │  Dashboard            │
                         │  Investigation        │
                         │  Actor Profiles       │
                         │  Relationship Graph   │
                         │  Timeline             │
                         │  Evidence             │
                         │  AI Analysis          │
                         └───────────┬───────────┘
                                     │
                              HTTPS REST API
                                     │
                                     ▼
                    ┌──────────────────────────────┐
                    │      Spring Boot Backend     │
                    │                              │
                    │ Authentication               │
                    │ Threat Actors                │
                    │ Personas                     │
                    │ Search                       │
                    │ Stylometry                   │
                    │ Linkage Analysis             │
                    │ Evidence                     │
                    │ Timeline                     │
                    │ Relationship Graph           │
                    │ Export                       │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
             ┌─────────────┐              ┌──────────────┐
             │ H2 Database │              │ Gemini API   │
             │             │              │              │
             │ Intelligence│              │ AI Analysis  │
             │ Data        │              │ Explanations │
             └─────────────┘              └──────────────┘