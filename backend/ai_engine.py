"""
HireSmart AI - Deterministic, Bias-Free Resume Ranking Engine
Uses Scikit-Learn TfidfVectorizer and Cosine Similarity to compute semantic match scores
between job requisitions and candidate resumes without any demographic features.
"""

import logging
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("hiresmart.ai_engine")


def rank_resumes(
    job_description: str,
    candidate_resumes: List[Dict[str, Any]],
    required_skills: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Ranks candidate resumes against a job description in a purely deterministic,
    audit-verifiable, and demographic-free manner.

    Args:
        job_description: Text of the job title, requirements, and responsibilities.
        candidate_resumes: List of dicts, each with keys:
            - 'candidate_id': int
            - 'text': str (anonymized resume text)
            - 'skills': List[str] (extracted technical skills)
            - 'cgpa': Optional[float]
        required_skills: Optional list of skill keywords explicitly mandated by the job.

    Returns:
        List of dicts sorted by score descending:
        [
            {
                "candidate_id": int,
                "score": float (0.0 to 100.0),
                "percentile": float (0.0 to 100.0),
                "fit_category": "High Fit" | "Moderate Fit" | "Low Fit",
                "matching_skills": List[str]
            },
            ...
        ]
    """
    if not candidate_resumes:
        return []

    req_skills_set = set(s.lower() for s in (required_skills or []))
    
    # Construct combined job search query with skill emphasis
    job_corpus_entry = f"{job_description} {' '.join(required_skills or [])}".strip()
    if not job_corpus_entry:
        job_corpus_entry = "Software Engineering Technical Role"

    candidate_texts: List[str] = []
    matching_skills_map: Dict[int, List[str]] = {}

    for cand in candidate_resumes:
        cand_id = cand["candidate_id"]
        cand_text = cand.get("text", "") or ""
        cand_skills = cand.get("skills", []) or []

        # Find skill intersection
        matched = [s for s in cand_skills if s.lower() in req_skills_set or not req_skills_set]
        matching_skills_map[cand_id] = matched

        # Combine technical skills and anonymized text for TF-IDF representation
        enriched_text = f"{' '.join(cand_skills * 2)} {cand_text}".strip()
        candidate_texts.append(enriched_text if enriched_text else "General Engineering")

    # Corpus: index 0 is Job, indices 1..N are candidates
    corpus = [job_corpus_entry] + candidate_texts

    # 1. TF-IDF Vectorization with unigrams & bigrams
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        lowercase=True,
        sublinear_tf=True,
        min_df=1,
    )

    tfidf_matrix = vectorizer.fit_transform(corpus)

    # 2. Compute Cosine Similarity between Job (row 0) and each Candidate (rows 1..N)
    job_vector = tfidf_matrix[0:1]
    candidate_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(job_vector, candidate_vectors)[0]

    results: List[Dict[str, Any]] = []

    for idx, cand in enumerate(candidate_resumes):
        cand_id = cand["candidate_id"]
        raw_sim = float(similarities[idx])

        # Base score scaled to 0-100
        # Cosine similarity for document vectors typically ranges 0.1 to 0.7; we map it realistically
        scaled_score = min(100.0, max(10.0, raw_sim * 125.0))

        # Skill bonus: boost by up to 10 points for strong skill intersection
        if req_skills_set:
            cand_skill_count = len(matching_skills_map[cand_id])
            req_skill_count = len(req_skills_set)
            skill_coverage = cand_skill_count / max(1, req_skill_count)
            scaled_score = min(100.0, scaled_score + (skill_coverage * 10.0))

        final_score = round(scaled_score, 2)

        # Categorize into standard HRMS Fit Bands
        if final_score >= 65.0:
            fit_category = "High Fit"
        elif final_score >= 40.0:
            fit_category = "Moderate Fit"
        else:
            fit_category = "Low Fit"

        results.append({
            "candidate_id": cand_id,
            "score": final_score,
            "fit_category": fit_category,
            "matching_skills": matching_skills_map[cand_id],
        })

    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Compute percentiles
    total_candidates = len(results)
    for rank, entry in enumerate(results):
        if total_candidates > 1:
            # Percentile: (N - rank) / N * 100
            percentile = round(((total_candidates - rank) / total_candidates) * 100.0, 1)
        else:
            percentile = 100.0
        entry["percentile"] = percentile

    logger.info(f"Deterministically ranked {total_candidates} candidates against job requisition.")
    return results
