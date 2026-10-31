"""
HireSmart AI - Google Gemini Generative AI Service
Provides interview question generation, constructive feedback synthesis,
and official offer letter drafting with 100% deterministic local fallbacks.
"""

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger("hiresmart.gemini_service")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()


def _get_gemini_client():
    """
    Initializes Google GenAI client if GEMINI_API_KEY is configured.
    Supports both the new 'google-genai' and legacy 'google-generativeai' SDKs.
    """
    if not GEMINI_API_KEY:
        return None

    try:
        # 1. Try modern google-genai SDK
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        return ("google-genai", client)
    except ImportError:
        pass

    try:
        # 2. Try legacy google-generativeai SDK
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=GEMINI_API_KEY)
        model = genai_legacy.GenerativeModel("gemini-1.5-flash")
        return ("google-generativeai", model)
    except Exception as e:
        logger.warning(f"Failed to initialize Gemini SDK: {e}")
        return None


# =============================================================================
# 1. GENERATE INTERVIEW QUESTIONS
# =============================================================================

def generate_interview_questions(
    role: str,
    required_skills: List[str],
    candidate_summary: str,
) -> List[Dict[str, Any]]:
    """
    Generates 5 tailored technical & behavioral interview questions categorized by topic
    with explicit evaluation cues ("what to listen for") and follow-up probes.
    """
    skills_str = ", ".join(required_skills) if required_skills else "General Systems Engineering"
    
    prompt = f"""
You are an expert Principal Systems Architect and Technical Interviewer at a premier technology enterprise.
Formulate 5 rigorous, tailored interview questions for a campus candidate applying for the role of '{role}'.

Target Technical Stack: {skills_str}
Candidate Technical Profile & Projects:
{candidate_summary}

Respond ONLY with a valid JSON array of exactly 5 question objects. No markdown wrapping, no extra keys.
Format:
[
  {{
    "id": 1,
    "topic": "Architecture / System Design / ML / Concurrency",
    "difficulty": "Intermediate / Advanced / Behavioral",
    "question": "The comprehensive interview probe",
    "what_to_look_for": "Key technical signals, tradeoffs, and expected answers",
    "follow_up": "A concise follow-up probe"
  }},
  ...
]
""".strip()

    client_info = _get_gemini_client()

    if client_info:
        sdk_type, client = client_info
        try:
            logger.info("Calling Gemini 1.5 Flash for interview question synthesis...")
            raw_text = ""
            if sdk_type == "google-genai":
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                raw_text = response.text
            else:
                response = client.generate_content(prompt)
                raw_text = response.text

            # Clean potential markdown fences ```json ... ```
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
            parsed = json.loads(cleaned)
            if isinstance(parsed, list) and len(parsed) >= 1:
                return parsed[:5]
        except Exception as e:
            logger.warning(f"Gemini API question generation failed ({e}); switching to deterministic fallback.")

    # Deterministic High-Quality Fallback Bank
    return _fallback_interview_questions(role, required_skills)


def _fallback_interview_questions(role: str, skills: List[str]) -> List[Dict[str, Any]]:
    """
    Deterministic question bank tailored to candidate track when Gemini is offline.
    """
    skills_set = set(s.lower() for s in skills)
    is_ml = any(s in skills_set for s in ["python", "pytorch", "transformers", "langchain", "vector dbs", "rag"])
    is_distributed = any(s in skills_set for s in ["go", "spark", "kafka", "kubernetes", "distributed systems"])

    if is_ml or "ai" in role.lower() or "ml" in role.lower():
        return [
            {
                "id": 1,
                "topic": "LLM Architecture & Retrieval (RAG)",
                "difficulty": "Advanced",
                "question": "In a distributed RAG pipeline, how do you mitigate the 'lost in the middle' phenomenon when injecting top-k vector chunks into an LLM context window?",
                "what_to_look_for": "Contextual re-ranking (Cohere / BGE), semantic chunking, and evaluation metrics like Groundedness and Context Relevance.",
                "follow_up": "How would you combine BM25 sparse retrieval with dense embeddings using Reciprocal Rank Fusion?"
            },
            {
                "id": 2,
                "topic": "Model Quantization & Inference Latency",
                "difficulty": "Advanced",
                "question": "When serving 7B-14B parameter models with strict sub-150ms latency budgets, compare AWQ, GPTQ, and FP8 quantization and explain PagedAttention memory paging.",
                "what_to_look_for": "Understanding weight-only vs activation quantization, continuous batching in vLLM, and elimination of physical memory fragmentation.",
                "follow_up": "How do you detect activation outliers in transformer attention layers?"
            },
            {
                "id": 3,
                "topic": "Vector DB Indexing Tradeoffs",
                "difficulty": "Intermediate",
                "question": "Compare Hierarchical Navigable Small World (HNSW) graphs with IVF-PQ in terms of query latency, recall fidelity, and memory consumption.",
                "what_to_look_for": "HNSW excels in low-latency search at higher RAM overhead; IVF-PQ compresses vectors into byte centroids for multi-million scale on budget hardware.",
                "follow_up": "Which distance metric (Cosine, Dot Product, L2) is optimal when vectors are unnormalized?"
            },
            {
                "id": 4,
                "topic": "System Guardrails & Defensive Engineering",
                "difficulty": "Intermediate",
                "question": "Describe how you build defensive guardrails against indirect prompt injections and hallucinated schema violations in production customer agents.",
                "what_to_look_for": "Dual-layer validation (regex input sanitizers + LLM Guard), constrained JSON schema tool-calling, and deterministic fallback paths.",
                "follow_up": "How do you monitor semantic drift across incoming user prompt embeddings over time?"
            },
            {
                "id": 5,
                "topic": "Engineering Ownership & Collaboration",
                "difficulty": "Behavioral",
                "question": "Tell me about a time in your university projects where a teammate proposed an architecture that had severe scalability bottlenecks. How did you guide them without conflict?",
                "what_to_look_for": "Empirical benchmark data over opinion, proactive proof-of-concept spikes, and constructive peer review.",
                "follow_up": "What was the final architecture agreed upon by the team?"
            }
        ]
    elif is_distributed or "data" in role.lower():
        return [
            {
                "id": 1,
                "topic": "Consensus Protocols & Fault Tolerance",
                "difficulty": "Advanced",
                "question": "Walk through how the Raft consensus protocol handles split-brain network partitions, and explain how term numbers ensure stale leaders are rejected.",
                "what_to_look_for": "Quorum rule (> N/2), randomized election timeouts, and log replication validation prior to client commit confirmation.",
                "follow_up": "How does log compaction via snapshotting prevent unbounded disk exhaustion in Raft?"
            },
            {
                "id": 2,
                "topic": "Message Ordering & Streaming",
                "difficulty": "Intermediate",
                "question": "How does Apache Kafka guarantee message ordering while scaling consumption horizontally across multiple consumer group nodes?",
                "what_to_look_for": "Partition key hashing guarantees total order within a partition; cooperative sticky rebalancing prevents consumer stop-the-world pauses.",
                "follow_up": "What causes consumer group poll timeouts and poison-pill message loops?"
            },
            {
                "id": 3,
                "topic": "Distributed Storage Sharding",
                "difficulty": "Intermediate",
                "question": "When designing a high-throughput time-series metrics engine, how do you choose a shard key to avoid write hot-spotting on the current timestamp?",
                "what_to_look_for": "Composite keys (hash prefix of tenant/device ID + bucketed timestamp suffix) and consistent hashing rings.",
                "follow_up": "How do distributed databases like Cassandra handle tombstone accumulation during bulk deletes?"
            },
            {
                "id": 4,
                "topic": "Chaos Engineering & Backpressure",
                "difficulty": "Intermediate",
                "question": "How do you handle cascading failure scenarios where downstream databases experience query throttling and consumer buffers overflow?",
                "what_to_look_for": "Token-bucket rate limiters, circuit breakers (e.g. Resilience4j concepts), sliding window backpressure, and Dead Letter Queues (DLQ).",
                "follow_up": "What health check probe design prevents Kubernetes from killing pods under normal transient high load?"
            },
            {
                "id": 5,
                "topic": "Production Incident Post-Mortem",
                "difficulty": "Behavioral",
                "question": "Describe an incident where a service you deployed crashed under unexpected peak traffic. How did you diagnose the root cause and ensure it never reoccurred?",
                "what_to_look_for": "Structured telemetry inspection (metrics before code changes), blameless post-mortem writing, and automated regression tests.",
                "follow_up": "What early warning alert was added to the observability dashboard afterwards?"
            }
        ]
    else:
        # Full-Stack & General Software Engineering
        return [
            {
                "id": 1,
                "topic": "Concurrency & State Synchronization",
                "difficulty": "Advanced",
                "question": "In a real-time collaborative workspace, how do you handle concurrent state mutations between two disconnected clients without server-side locking?",
                "what_to_look_for": "Conflict-free Replicated Data Types (CRDTs) like Yjs or Automerge vs Operational Transformation (OT), vector clocks, and deterministic merges.",
                "follow_up": "How do you handle exponential backoff reconnection over unstable mobile network switching?"
            },
            {
                "id": 2,
                "topic": "Database Isolation Levels & Lock Contention",
                "difficulty": "Intermediate",
                "question": "Explain the difference between Read Committed and Serializable isolation levels in PostgreSQL. How do you prevent phantom reads in an e-commerce checkout transaction?",
                "what_to_look_for": "MVCC mechanisms, row-level pessimistic locking (SELECT FOR UPDATE) vs optimistic version check columns.",
                "follow_up": "When is an advisory lock preferable to an explicit table lock?"
            },
            {
                "id": 3,
                "topic": "API Idempotency & Rate Limiting",
                "difficulty": "Intermediate",
                "question": "When architecting payment and webhook APIs consumed by third parties, how do you enforce idempotent request execution and prevent double-spending?",
                "what_to_look_for": "Idempotency keys stored in Redis with atomic SETNX and finite TTL; HTTP 429 Retry-After headers and token bucket counters.",
                "follow_up": "How do you gracefully deprecate non-breaking vs breaking schema changes in GraphQL or REST?"
            },
            {
                "id": 4,
                "topic": "Frontend Rendering Budgets & Optimization",
                "difficulty": "Intermediate",
                "question": "How do you diagnose and eliminate unnecessary re-renders in a complex React dashboard presenting data tables with 5,000+ interactive rows?",
                "what_to_look_for": "DOM virtualization (TanStack Virtual), memoization boundaries (useMemo/useCallback), and Profiler Flamegraph auditing.",
                "follow_up": "What are the runtime performance implications of CSS-in-JS versus utility classes?"
            },
            {
                "id": 5,
                "topic": "Pragmatic Tradeoffs & Technical Debt",
                "difficulty": "Behavioral",
                "question": "Describe a scenario where strict delivery deadlines forced you to accept technical debt. How did you document, isolate, and eventually resolve that debt?",
                "what_to_look_for": "Pragmatic architecture, tracking debt explicitly in issues with estimated interest, and establishing boundary abstractions.",
                "follow_up": "Did that shortcut ever cause a production regression?"
            }
        ]


# =============================================================================
# 2. GENERATE CANDIDATE FEEDBACK REPORT
# =============================================================================

def generate_candidate_feedback(
    candidate_name: str,
    role: str,
    notes: str,
    avg_rating: float,
) -> str:
    """
    Produces a structured, constructive candidate evaluation feedback report.
    """
    prompt = f"""
Draft a concise, professional, and constructive interview feedback report for campus recruitment.
Candidate: {candidate_name}
Target Role: {role}
Composite Interview Score: {avg_rating} / 5.0
Interviewer Notes:
"{notes}"

Include:
1. Candidate Technical Strengths
2. Problem Solving & Architectural Analysis
3. Communication & Collaboration Observations
4. Specific Recommendations for Professional Growth
5. Final Evaluation Recommendation

Tone: Objective, encouraging, and clear.
""".strip()

    client_info = _get_gemini_client()
    if client_info:
        sdk_type, client = client_info
        try:
            if sdk_type == "google-genai":
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                return response.text.strip()
            else:
                response = client.generate_content(prompt)
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini feedback generation failed ({e}); using deterministic report template.")

    # Deterministic Structured Feedback Fallback
    hire_decision = "Strong Hire" if avg_rating >= 4.5 else "Hire" if avg_rating >= 3.5 else "Borderline" if avg_rating >= 2.5 else "No Hire"
    return f"""
### Comprehensive Candidate Evaluation & Feedback Report
**Candidate:** {candidate_name}  
**Evaluated Role:** {role}  
**Composite Rating:** {avg_rating:.1f} / 5.0 ({hire_decision})

#### 1. Core Technical Competence
Candidate exhibited strong algorithmic proficiency and clear domain mastery in required tools. Code logic was structured cleanly, with deliberate attention to time and space complexities.

#### 2. Problem Solving & Systems Thinking
Approached architectural edge cases methodically. Stated initial assumptions upfront, isolated edge conditions gracefully, and verified solution correctness before coding.

#### 3. Communication & Articulation
Communication was crisp, structured, and receptive to hints. Explanations were grounded in practical system engineering realities.

#### 4. Qualitative Interviewer Observations
"{notes}"

#### 5. Hiring Committee Recommendation
Candidate is recommended as **{hire_decision}** for the university campus placement cohort.
""".strip()


# =============================================================================
# 3. GENERATE FORMAL OFFER LETTER
# =============================================================================

def generate_offer_letter(
    candidate_name: str,
    role: str,
    ctc: str,
    joining_date: str,
    college: str,
) -> str:
    """
    Generates formal appointment offer letter text for an accepted campus applicant.
    """
    prompt = f"""
Generate an official formal campus placement offer letter for:
Candidate Name: {candidate_name}
College / University: {college}
Target Position: {role}
Annual Compensation (CTC): {ctc}
Tentative Joining Date: {joining_date}
Company: HireSmart Technologies India Pvt. Ltd.

Include welcoming opening remarks, compensation summary, reporting expectations, and professional sign-offs.
Keep format clean and suitable for formal document rendering.
""".strip()

    client_info = _get_gemini_client()
    if client_info:
        sdk_type, client = client_info
        try:
            if sdk_type == "google-genai":
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                return response.text.strip()
            else:
                response = client.generate_content(prompt)
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini offer letter generation failed ({e}); using deterministic template.")

    # Deterministic Formal Offer Letter Fallback
    return f"""
HIRESMART TECHNOLOGIES INDIA PVT. LTD.
Campus Talent Acquisition Division • Confidential

Date: {joining_date}
To: {candidate_name}
Institution: {college}

Subject: Formal Letter of Employment Offer – {role}

Dear {candidate_name},

On behalf of HireSmart Technologies India Pvt. Ltd., we are delighted to formally offer you employment in the position of {role}.

Based on your outstanding technical demonstrations, problem-solving agility, and academic record during our campus selection drive, our technical committee is confident you will make transformative contributions to our engineering teams.

Offer Highlights & Compensation Terms:
- Position Title: {role}
- Total Annual Cost to Company (CTC): {ctc}
- Work Location: Bengaluru Technology Center / Hybrid
- Commencement Date: {joining_date}

This offer is subject to satisfactory verification of your degree completion, official university transcripts, and standard background clearance.

Please indicate your acceptance of this appointment by signing and returning the confirmation copy within ten (10) business days.

We look forward to welcoming you aboard!

Sincerely,

Sarah Jenkins
Head of Global University Talent Acquisition
HireSmart Technologies India Pvt. Ltd.
""".strip()
