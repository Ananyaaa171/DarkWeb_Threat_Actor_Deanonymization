# Dark Web Deanonymizer Platform

> An explainable cyber-threat intelligence platform for correlating dark-web personas, digital identifiers, infrastructure, behavioral patterns, and writing style to support potential threat-actor attribution.

---

## ⚠️ Disclaimer

This project is a **research and educational prototype** intended for cybersecurity research, threat-intelligence analysis, and controlled demonstrations.

It does not provide guaranteed real-world identity attribution or deanonymization. Attribution scores represent correlations generated from the project's deterministic analytical model and should not be interpreted as definitive proof of identity.

Use only with legally obtained data and in authorized environments.

---

## 🎯 Overview

Dark-web investigations often involve fragmented information spread across multiple personas, forums, cryptographic identifiers, cryptocurrency wallets, infrastructure, and historical activity.

The **Dark Web Deanonymizer Platform (DWD)** provides a unified investigation environment for correlating these signals.

The platform combines:

- Threat-actor and persona profiling
- Digital identifier correlation
- Infrastructure relationship analysis
- Statistical stylometry
- Behavioral pattern analysis
- Deterministic multi-factor attribution scoring
- Explainable Gemini-generated forensic summaries
- Relationship graph visualization
- Chronological intelligence timelines
- Investigation report exports

The objective is to transform fragmented indicators into a structured, explainable investigation workflow.

---

# 🧠 Core Attribution Pipeline

The platform uses a deterministic four-factor attribution model:

```text
                         Persona A
                             │
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Investigation Engine│
                  └──────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Identifiers          Stylometry           Behavior
     35%                   25%                  20%
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                      Infrastructure
                           20%
                             │
                             ▼
                ┌─────────────────────────┐
                │ Attribution Score       │
                │                         │
                │ 0.35 ID                 │
                │ + 0.25 Stylometry       │
                │ + 0.20 Behavior         │
                │ + 0.20 Infrastructure   │
                └────────────┬────────────┘
                             │
                             ▼
                  Confidence Classification
                             │
                             ▼
                 Gemini Explainable Brief
                             │
                             ▼
                    Evidence Matrix