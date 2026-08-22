-- ============================================================================
-- Dark Web Deanonymizer — Demonstration & Research Seed Dataset
-- 
-- IMPORTANT NOTICE:
-- All data contained herein is SYNTHETIC & SANITIZED for academic research
-- and demonstration purposes only in accordance with Smart India Hackathon rules.
-- No real credentials, private keys, or sensitive personal data are included.
-- ============================================================================

-- Clean up existing data in reverse order of foreign keys
DELETE FROM evidence_items;
DELETE FROM linkage_analysis;
DELETE FROM timeline_events;
DELETE FROM stylometric_samples;
DELETE FROM infrastructure;
DELETE FROM identifiers;
DELETE FROM personas;
DELETE FROM threat_actors;

-- ----------------------------------------------------------------------------
-- 1. Threat Actors
-- ----------------------------------------------------------------------------
INSERT INTO threat_actors (id, canonical_name, threat_category, primary_motive, status, overall_confidence_score, summary, first_observed_at, last_observed_at)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'LockBit Syndicate Core',
    'RANSOMWARE',
    'FINANCIAL',
    'ACTIVE',
    92.50,
    'Prominent Ransomware-as-a-Service (RaaS) developer and affiliate operator known for double-extortion tactics, affiliate training manuals, and migration across underground forums.',
    '2021-04-10 10:00:00+00',
    '2026-08-15 18:30:00+00'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'ShinyHunters Data Collective',
    'DATA_BROKER',
    'FINANCIAL',
    'ACTIVE',
    84.00,
    'Prolific cloud database breach and data broker collective specializing in enterprise credential theft and public auctions across underground leak portals.',
    '2022-01-14 08:15:00+00',
    '2026-08-10 12:00:00+00'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'ALPHV / BlackCat Group',
    'RANSOMWARE',
    'FINANCIAL',
    'DORMANT',
    78.00,
    'Rust-based advanced ransomware group utilizing multi-stage data exfiltration and customized Tor negotiation portals.',
    '2021-11-20 14:00:00+00',
    '2026-06-01 09:45:00+00'
);

-- ----------------------------------------------------------------------------
-- 2. Personas (Handles across forums & channels)
-- ----------------------------------------------------------------------------
INSERT INTO personas (id, actor_id, handle, platform, profile_url, reputation_score, status, activity_timezone_estimated, first_seen_at, last_seen_at)
VALUES
-- LockBit personas (Demonstrating Migration from XSS to Ramp Forum)
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'bassterlord_xss',
    'XSS.is',
    'https://xss.is/members/bassterlord.49120/',
    98.50,
    'MIGRATED',
    'UTC+3 (MSK)',
    '2021-04-12 11:20:00+00',
    '2023-01-20 15:45:00+00'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'basster_rampv2',
    'Ramp Forum',
    'https://ramp4u...onion/user/basster_rampv2',
    94.00,
    'ACTIVE',
    'UTC+3 (MSK)',
    '2023-02-01 09:10:00+00',
    '2026-08-15 18:30:00+00'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'basster_support_tg',
    'Telegram',
    'https://t.me/basster_support_sec',
    80.00,
    'ACTIVE',
    'UTC+3 (MSK)',
    '2023-03-10 14:00:00+00',
    '2026-08-14 20:00:00+00'
),
-- ShinyHunters personas
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'pompom_breached',
    'Breached.vc',
    'https://breached.vc/User-pompompurin',
    95.00,
    'BANNED',
    'UTC-5 (EST)',
    '2022-01-14 08:15:00+00',
    '2023-03-17 19:30:00+00'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'shiny_tg_channel',
    'Telegram',
    'https://t.me/shiny_leaks_direct',
    88.00,
    'ACTIVE',
    'UTC-5 (EST)',
    '2023-04-02 16:00:00+00',
    '2026-08-10 12:00:00+00'
),
-- ALPHV persona
(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000003',
    'alphv_rep',
    'Exploit.in',
    'https://exploit.in/user/alphv_rep',
    91.00,
    'DORMANT',
    'UTC+2 (EET)',
    '2021-11-20 14:00:00+00',
    '2026-06-01 09:45:00+00'
);

-- ----------------------------------------------------------------------------
-- 3. Identifiers (Digital Fingerprints)
-- ----------------------------------------------------------------------------
INSERT INTO identifiers (id, persona_id, type, value, metadata, is_verified, first_seen_at)
VALUES
-- bassterlord_xss identifiers
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'PGP_FINGERPRINT',
    '94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF',
    '{"key_size": 4096, "algo": "RSA", "created_date": "2021-04-11", "subkey_id": "0x4A72B5C1"}'::jsonb,
    true,
    '2021-04-12 11:20:00+00'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'BTC_WALLET',
    'bc1q9x38s72k08vwq83uam9l2w7r0y75z0z8g047xy',
    '{"currency": "BTC", "tx_count": 48, "total_received_btc": 28.65, "cluster_tag": "LockBit-Affiliate-Pool"}'::jsonb,
    true,
    '2021-06-15 14:30:00+00'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'TOX_ID',
    'E8A1849D94C381F082982847B0E76353982A31B057C0A98F74E664971A598D081B76E2A54019',
    '{"verified_via": "XSS-Profile-Signature"}'::jsonb,
    true,
    '2021-04-12 11:20:00+00'
),
-- basster_rampv2 identifiers (Demonstrating matching PGP subkey and BTC address!)
(
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'PGP_FINGERPRINT',
    '94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF',
    '{"key_size": 4096, "algo": "RSA", "created_date": "2021-04-11", "subkey_id": "0x4A72B5C1"}'::jsonb,
    true,
    '2023-02-01 09:10:00+00'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'BTC_WALLET',
    'bc1q9x38s72k08vwq83uam9l2w7r0y75z0z8g047xy',
    '{"currency": "BTC", "tx_count": 48, "total_received_btc": 28.65, "cluster_tag": "LockBit-Affiliate-Pool"}'::jsonb,
    true,
    '2023-02-05 16:20:00+00'
),
(
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'XMR_WALLET',
    '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkFxbTNsFa5P8VEsubcG2N8sPCW3maGgWinnU74m8WdKpz2q5zH1x',
    '{"currency": "XMR", "purpose": "Affiliate Commission Settlement"}'::jsonb,
    false,
    '2023-03-01 10:00:00+00'
),
-- pompom_breached & shiny_tg identifiers
(
    'c0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000004',
    'EMAIL',
    'pompompurin@cock.li',
    '{"service": "Cock.li Secure Webmail"}'::jsonb,
    true,
    '2022-01-14 08:15:00+00'
),
(
    'c0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000005',
    'EMAIL',
    'shiny_intel_press@cock.li',
    '{"service": "Cock.li Secure Webmail"}'::jsonb,
    false,
    '2023-04-02 16:00:00+00'
),
(
    'c0000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000006',
    'BTC_WALLET',
    'bc1q87w0f2a7x5l5g7h8j2k3l4m5n6o7p8q9r0s1t2',
    '{"currency": "BTC", "tx_count": 19, "total_received_btc": 11.2}'::jsonb,
    true,
    '2021-11-25 12:00:00+00'
);

-- ----------------------------------------------------------------------------
-- 4. Infrastructure (Darknet Hidden Services, Mirrors, C2)
-- ----------------------------------------------------------------------------
INSERT INTO infrastructure (id, persona_id, type, value, ip_address, asn, ssl_cert_fingerprint, is_live, last_scanned_at)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'ONION_V3',
    'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
    NULL,
    'Tor Hidden Service Network',
    '3F:8A:1B:44:99:C2:5E:71:0D:33:4A:BC:88:2E:FA:01',
    true,
    '2026-08-20 10:00:00+00'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'CLEARSIGNAL_MIRROR',
    'http://ransomleaks-backup47.onion',
    '185.220.101.44',
    'AS200651 Flokinet Ltd',
    '3F:8A:1B:44:99:C2:5E:71:0D:33:4A:BC:88:2E:FA:01',
    true,
    '2026-08-20 10:00:00+00'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    'ONION_V3',
    'http://breached67haskj28s7dfgsjhdg28736sdfsdfsdf2736sdjsdf.onion',
    NULL,
    'Tor Hidden Service Network',
    'AA:BB:CC:11:22:33:44:55:66:77:88:99:00:11:22:33',
    false,
    '2026-08-18 12:00:00+00'
);

-- ----------------------------------------------------------------------------
-- 5. Stylometric Text Samples
-- ----------------------------------------------------------------------------
INSERT INTO stylometric_samples (id, persona_id, sample_title, raw_text, clean_text, token_count, lexical_metrics, collected_at)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'XSS Forum Post #412: Manual for Initial Access',
    'Hello to all forum members. Releasing practical manual for initial access network compromise and domain escalation. Always inspect domain trusts first before payload execution. Do not touch CIS infrastructure under any conditions))) For lockers contact directly via tox only.',
    'hello to all forum members releasing practical manual for initial access network compromise and domain escalation always inspect domain trusts first before payload execution do not touch cis infrastructure under any conditions for lockers contact directly via tox only',
    44,
    '{"ttr": 0.77, "yules_k": 38.4, "avg_sentence_len": 11.0, "punctuation_rate": 0.068, "slavic_smiley_count": 1}'::jsonb,
    '2021-06-20 14:00:00+00'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Ramp Forum Thread #88: Locker Affiliate Rules',
    'We migrated here from previous boards. Affiliate rules are standard: 80/20 split, 24/7 decryptor support, custom builds delivered fast. Never target CIS government or healthcare entities under any circumstances))) Reach out on tox or pgp verified message.',
    'we migrated here from previous boards affiliate rules are standard 80 20 split 24 7 decryptor support custom builds delivered fast never target cis government or healthcare entities under any circumstances reach out on tox or pgp verified message',
    40,
    '{"ttr": 0.80, "yules_k": 36.1, "avg_sentence_len": 10.0, "punctuation_rate": 0.075, "slavic_smiley_count": 1}'::jsonb,
    '2023-02-12 10:15:00+00'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    'Breached.vc Announcement #1: Database Auction',
    'Hey guys, today I am selling the complete customer database of major telecommunications provider. 14 million records including names, hashed passwords, DOB, and phone numbers. Bidding starts at 15k USD in BTC/XMR. Serious buyers PM me on Telegram.',
    'hey guys today i am selling the complete customer database of major telecommunications provider 14 million records including names hashed passwords dob and phone numbers bidding starts at 15k usd in btc xmr serious buyers pm me on telegram',
    39,
    '{"ttr": 0.82, "yules_k": 32.5, "avg_sentence_len": 13.0, "punctuation_rate": 0.051, "slavic_smiley_count": 0}'::jsonb,
    '2022-04-10 18:00:00+00'
);

-- ----------------------------------------------------------------------------
-- 6. Linkage Analysis (Deterministic Attribution Scores)
-- ----------------------------------------------------------------------------
INSERT INTO linkage_analysis (
    id, source_persona_id, target_persona_id,
    attribution_score, confidence_level,
    identifier_score, stylometric_score, behavioral_score, infrastructure_score,
    ai_explanation_summary, analyst_review_status, computed_at
)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', -- bassterlord_xss
    'b0000000-0000-0000-0000-000000000002', -- basster_rampv2
    89.50,
    'HIGH',
    95.00, -- 35% weight -> 33.25 pts
    88.00, -- 25% weight -> 22.00 pts
    85.00, -- 20% weight -> 17.00 pts
    86.25, -- 20% weight -> 17.25 pts
    'High-probability persona migration confirmed. Both personas publish the identical PGP subkey ID 0x4A72B5C1, utilize the same Bitcoin deposit wallet (bc1q9x38...), maintain active posting hours in the UTC+3 (MSK) timezone window, and share distinctive Russian-English stylometric markers including triple-parentheses punctuation (")))") and identical CIS targeting prohibitions.',
    'CONFIRMED',
    '2026-08-20 15:00:00+00'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000004', -- pompom_breached
    'b0000000-0000-0000-0000-000000000005', -- shiny_tg_channel
    78.40,
    'MODERATE',
    75.00, -- 35% weight -> 26.25 pts
    82.00, -- 25% weight -> 20.50 pts
    80.00, -- 20% weight -> 16.00 pts
    78.25, -- 20% weight -> 15.65 pts
    'Plausible correlation between forum broker and Telegram distribution channel. Matched Cock.li domain email format, consistent American colloquial phrasing ("Hey guys"), and matching database dump release timelines.',
    'PENDING',
    '2026-08-21 09:30:00+00'
);

-- ----------------------------------------------------------------------------
-- 7. Evidence Items (Substantiating the Linkage Scores)
-- ----------------------------------------------------------------------------
INSERT INTO evidence_items (id, linkage_id, factor_category, title, contribution_points, details, evidence_snippet)
VALUES
(
    '70000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'IDENTIFIER',
    'Matching PGP Master Key & Subkey ID 0x4A72B5C1',
    33.25,
    'Cryptographic public key fingerprint matches exactly across XSS and Ramp user profiles.',
    'PGP Fingerprint: 94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF'
),
(
    '70000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'IDENTIFIER',
    'Shared Bitcoin Deposit Address',
    31.50,
    'Identical on-chain Bitcoin deposit wallet observed in payment instructions on both boards.',
    'BTC Wallet: bc1q9x38s72k08vwq83uam9l2w7r0y75z0z8g047xy'
),
(
    '70000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000001',
    'STYLOMETRY',
    'Lexical Richness & Slavic Punctuation Signature',
    22.00,
    'Statistical n-gram correlation (88%) with characteristic trailing closing parentheses (")))") and identical clause sequencing.',
    'Snippet: "...under any conditions))) For lockers contact directly via tox only."'
),
(
    '70000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'BEHAVIOR',
    'Temporal Activity Window Aligned to UTC+3 (MSK)',
    17.00,
    'Post timestamp clustering exhibits peak activity between 09:00 and 18:00 UTC+3 with dormancy during night hours.',
    'Estimated Active Window: 09:00 - 18:30 UTC+3'
),
(
    '70000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000001',
    'INFRASTRUCTURE',
    'Co-located SSL Certificate & Mirror Infrastructure',
    17.25,
    'Shared SSL certificate fingerprint observed on darknet mirror hosted on Flokinet AS200651.',
    'SSL Fingerprint: 3F:8A:1B:44:99:C2:5E:71:0D:33:4A:BC:88:2E:FA:01'
);

-- ----------------------------------------------------------------------------
-- 8. Timeline Events
-- ----------------------------------------------------------------------------
INSERT INTO timeline_events (id, persona_id, event_type, title, description, event_timestamp, source_reference, severity)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'FORUM_POST',
    'Account Registered on XSS.is',
    'Initial registration of handle bassterlord_xss with PGP key attachment.',
    '2021-04-12 11:20:00+00',
    'XSS.is Forum Archive',
    'INFO'
),
(
    '80000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'FORUM_POST',
    'Published Network Intrusion Manual',
    'Shared 40-page tutorial on Active Directory privilege escalation for affiliate recruitments.',
    '2021-06-20 14:00:00+00',
    'XSS.is Thread #412',
    'MEDIUM'
),
(
    '80000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'WALLET_PAYMENT',
    'Bitcoin Escrow Deposit Recorded',
    'Escrow deposit of 2.5 BTC processed to verified address bc1q9x38s72k08vwq83uam9l2w7r0y75z0z8g047xy.',
    '2022-03-15 16:40:00+00',
    'On-chain Transaction Log',
    'HIGH'
),
(
    '80000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'PERSONA_MIGRATION',
    'Account Dormancy on XSS Board',
    'Last active session on XSS.is. Forum admin notes account inactivity.',
    '2023-01-20 15:45:00+00',
    'XSS.is User Status Log',
    'MEDIUM'
),
(
    '80000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'FORUM_POST',
    'New Account Registered on Ramp Forum as basster_rampv2',
    'Handle basster_rampv2 registered on Ramp Forum citing migration from previous underground forums.',
    '2023-02-01 09:10:00+00',
    'Ramp Forum Member Directory',
    'HIGH'
),
(
    '80000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'INFRA_ONLINE',
    'New Ransomware Leak Portal Mirror Live',
    'Launched mirror site at http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion.',
    '2023-05-18 20:00:00+00',
    'Tor Directory Monitor Feed',
    'CRITICAL'
),
(
    '80000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000004',
    'BREACH_ANNOUNCED',
    'Major Telecom Database Breach Auctioned',
    'Published auction for 14M user database on Breached.vc.',
    '2022-04-10 18:00:00+00',
    'Breached.vc Thread #1094',
    'CRITICAL'
);
