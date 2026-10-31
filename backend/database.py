"""
HireSmart AI - Database Connection Pool & Session Management
Provides connection pooling, transactions, safe rollback, and typed query execution helpers
using mysql-connector-python with MySQLConnectionPool, and automatic zero-config SQLite
fallback with automatic table creation and seed data loading.
"""

import os
import sys
import logging
import sqlite3
import threading
from contextlib import contextmanager
from typing import Any, Dict, Generator, List, Optional, Tuple, Union

# Configure logger
logger = logging.getLogger("hiresmart.database")
logging.basicConfig(level=logging.INFO)

# Environment variables with safe default fallbacks
DB_ENGINE = os.getenv("DB_ENGINE", "auto").lower()  # "auto", "mysql", "sqlite"
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password")
DB_NAME = os.getenv("DB_NAME", "hiresmart_db")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
SQLITE_DB_PATH = os.getenv(
    "SQLITE_DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "hiresmart.db"),
)

_active_engine: Optional[str] = None  # "mysql" or "sqlite"
_mysql_pool: Any = None
_thread_local = threading.local()


# =============================================================================
# SQLITE EMBEDDED ENGINE & AUTOMATIC SEEDING
# =============================================================================

def _init_sqlite_database(conn: sqlite3.Connection) -> None:
    """Initializes tables and seeds baseline records if table users is empty."""
    cursor = conn.cursor()
    cursor.executescript("""
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS colleges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        tier TEXT,
        tpo_contact_email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS college_drives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        college_id INTEGER,
        drive_name TEXT NOT NULL,
        drive_date DATE,
        status TEXT DEFAULT 'UPCOMING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        college_name TEXT,
        cgpa REAL,
        phone TEXT,
        degree TEXT,
        extracted_skills TEXT,
        raw_resume_text TEXT,
        resume_file_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_postings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drive_id INTEGER,
        recruiter_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        required_skills TEXT,
        min_cgpa REAL DEFAULT 7.00,
        openings INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drive_id) REFERENCES college_drives(id) ON DELETE SET NULL,
        FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        candidate_id INTEGER NOT NULL,
        ai_match_score REAL,
        status TEXT DEFAULT 'APPLIED',
        coding_score INTEGER,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        UNIQUE (job_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER UNIQUE NOT NULL,
        interviewer_id INTEGER,
        scheduled_at TIMESTAMP,
        generated_questions TEXT,
        technical_rating INTEGER,
        communication_rating INTEGER,
        problem_solving_rating INTEGER,
        feedback_notes TEXT,
        candidate_feedback_report TEXT,
        status TEXT DEFAULT 'SCHEDULED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS offer_letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER UNIQUE NOT NULL,
        ctc TEXT NOT NULL,
        joining_date DATE NOT NULL,
        offer_letter_text TEXT,
        status TEXT DEFAULT 'ISSUED',
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_type TEXT NOT NULL,
        anonymization_verified INTEGER DEFAULT 1,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # Check if seed data exists
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        logger.info("Seeding SQLite database with default users, jobs, and candidates...")
        # Password hash for 'Password123!'
        pw_hash = "$2b$12$w92OKlVsxIchbecW4LUtAuvalDHjGKZiDAcvp5egPNuMi.An4L4M2"

        users_data = [
            (1, "Vikram Malhotra", "vikram.malhotra@hiresmart.ai", "ADMIN", pw_hash),
            (2, "Sarah Jenkins", "sarah.jenkins@hiresmart.ai", "RECRUITER", pw_hash),
            (3, "Dr. Priya Nair", "priya.nair@hiresmart.ai", "INTERVIEWER", pw_hash),
            (4, "Aarav Sharma", "aarav.sharma@campus.iitb.ac.in", "CANDIDATE", pw_hash),
            (5, "Sneha Kulkarni", "sneha.k@pilani.bits-pilani.ac.in", "CANDIDATE", pw_hash),
            (6, "Rohan Deshmukh", "rohan.d@nitt.edu", "CANDIDATE", pw_hash),
            (7, "Ananya Roy", "ananya.roy@dtu.ac.in", "CANDIDATE", pw_hash),
            (8, "Vikramaditya Rao", "vikram.rao@iiit.ac.in", "CANDIDATE", pw_hash),
        ]
        cursor.executemany("INSERT INTO users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)", users_data)

        companies_data = [(1, "HireSmart Technologies India Pvt. Ltd.", "Enterprise AI & Cloud Infrastructure", "https://hiresmart.ai")]
        cursor.executemany("INSERT INTO companies (id, name, industry, website) VALUES (?, ?, ?, ?)", companies_data)

        colleges_data = [
            (1, "Indian Institute of Technology (IIT) Bombay", "Mumbai, Maharashtra", "Tier 1", "placements@iitb.ac.in"),
            (2, "Birla Institute of Technology and Science (BITS) Pilani", "Pilani, Rajasthan", "Tier 1", "tpo@pilani.bits-pilani.ac.in"),
        ]
        cursor.executemany("INSERT INTO colleges (id, name, location, tier, tpo_contact_email) VALUES (?, ?, ?, ?, ?)", colleges_data)

        drives_data = [
            (1, 1, 1, "Pan-India Tier-1 University Engineering Placement Drive 2026", "2026-11-15", "ACTIVE"),
            (2, 1, 2, "BITS Autonomous AI & Cloud Specialist Drive 2026", "2026-11-20", "UPCOMING"),
        ]
        cursor.executemany("INSERT INTO college_drives (id, company_id, college_id, drive_name, drive_date, status) VALUES (?, ?, ?, ?, ?, ?)", drives_data)

        candidates_data = [
            (1, 4, "Indian Institute of Technology (IIT) Bombay", 9.24, "+91 98765 43210", "B.Tech in Computer Science & Engineering",
             "Python, PyTorch, LangChain, FastAPI, Docker, Vector DBs, C++, System Design",
             "[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech CSE, IIT Bombay, CGPA: 9.24\nSkills: Python, PyTorch, LangChain, FastAPI, Docker, Vector DBs, C++, Git\nProjects: Distributed RAG Engine for Legal Discovery with Pinecone and FastAPI; Multi-Agent Code Reviewer with CodeLlama 7B.",
             "./uploads/aarav_sharma_resume.pdf"),
            (2, 5, "BITS Pilani", 8.86, "+91 98111 22334", "B.E. in Computer Science",
             "React, TypeScript, Node.js, PostgreSQL, Docker, AWS, GraphQL, TailwindCSS",
             "[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.E. Computer Science, BITS Pilani, CGPA: 8.86\nSkills: React, TypeScript, Node.js, PostgreSQL, Docker, AWS, GraphQL, REST APIs\nProjects: Real-time Collaborative Canvas using CRDTs and WebSockets; Multi-tenant SaaS billing platform.",
             "./uploads/sneha_kulkarni_resume.pdf"),
            (3, 6, "NIT Trichy", 8.62, "+91 97234 56789", "B.Tech in Information Technology",
             "Python, TensorFlow, Scikit-learn, SQL, FastAPI, Pandas, NumPy",
             "[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech IT, NIT Trichy, CGPA: 8.62\nSkills: Python, TensorFlow, Scikit-learn, SQL, FastAPI, Pandas, Data Engineering\nProjects: Mobile plant leaf disease classifier using PyTorch ResNet; Real-time traffic anomaly detection.",
             "./uploads/rohan_deshmukh_resume.pdf"),
            (4, 7, "Delhi Technological University (DTU)", 9.45, "+91 99000 88776", "B.Tech in Software Engineering",
             "Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, Raft",
             "[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech Software Engineering, DTU, CGPA: 9.45\nSkills: Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, Microservices\nProjects: Distributed streaming transaction ledger with Raft consensus; Real-time financial event telemetry pipeline.",
             "./uploads/ananya_roy_resume.pdf"),
            (5, 8, "IIIT Hyderabad", 8.91, "+91 91234 56780", "Dual Degree B.Tech + M.S. in CSE",
             "Python, PyTorch, Transformers, CUDA, Triton, C++, Linux",
             "[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: Dual Degree CSE, IIIT Hyderabad, CGPA: 8.91\nSkills: Python, PyTorch, Transformers, CUDA, Triton, C++, Low-level Systems\nProjects: Low-bit quantized attention kernel on CUDA; Distributed tensor parallelism benchmark on 8x A100 GPUs.",
             "./uploads/vikramaditya_rao_resume.pdf"),
        ]
        cursor.executemany("INSERT INTO candidates (id, user_id, college_name, cgpa, phone, degree, extracted_skills, raw_resume_text, resume_file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", candidates_data)

        jobs_data = [
            (1, 1, 2, "Associate AI/ML Engineer (GenAI Core)", "Design enterprise retrieval-augmented pipelines, fine-tune multimodal LLMs, and build high-throughput GPU inference microservices.", "Python, PyTorch, Transformers, LangChain, Vector DBs, FastAPI, Docker", 8.00, 15),
            (2, 1, 2, "Full Stack Cloud Developer", "Develop robust, low-latency web applications and cloud microservices utilizing modern reactive frameworks and containerized deployments.", "React, TypeScript, Node.js, PostgreSQL, Docker, AWS, REST APIs", 7.50, 25),
            (3, 1, 2, "Data Platform & Distributed Systems Engineer", "Architect fault-tolerant streaming pipelines processing terabytes of real-time telemetry and candidate event streams.", "Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, System Design", 7.20, 12),
        ]
        cursor.executemany("INSERT INTO job_postings (id, drive_id, recruiter_id, title, description, required_skills, min_cgpa, openings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", jobs_data)

        apps_data = [
            (1, 1, 1, 94.50, "INTERVIEW_SCHEDULED", 92),
            (2, 2, 2, 89.00, "SHORTLISTED", 88),
            (3, 1, 3, 76.50, "APPLIED", 78),
            (4, 3, 4, 96.00, "OFFERED", 98),
            (5, 1, 5, 92.50, "SHORTLISTED", 94),
        ]
        cursor.executemany("INSERT INTO applications (id, job_id, candidate_id, ai_match_score, status, coding_score) VALUES (?, ?, ?, ?, ?, ?)", apps_data)

        interviews_data = [
            (1, 1, 3, "2026-11-04 14:30:00", '[{"id": 1, "topic": "RAG Systems", "question": "How do you mitigate context fragmentation and lost-in-the-middle phenomena in dense vector retrieval?", "what_to_look_for": "Semantic chunking and contextual re-ranking"}]', None, None, None, None, None, "SCHEDULED"),
            (2, 4, 3, "2026-10-25 11:00:00", '[{"id": 1, "topic": "Consensus", "question": "Walk through Raft leader election failure recovery.", "what_to_look_for": "Quorum counts and term numbers"}]', 5, 5, 5, "Mastery of distributed consensus and goroutines. Strong hire.", "Candidate demonstrated rare architectural maturity for an undergraduate. Immediate strong hire recommendation.", "COMPLETED"),
        ]
        cursor.executemany("INSERT INTO interviews (id, application_id, interviewer_id, scheduled_at, generated_questions, technical_rating, communication_rating, problem_solving_rating, feedback_notes, candidate_feedback_report, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", interviews_data)

        offers_data = [(1, 4, "₹24,50,000 CTC", "2026-07-01", "Official Letter of Employment\nCandidate: Ananya Roy\nRole: Data Platform & Distributed Systems Engineer\nFixed Base: ₹18,00,000 | Joining Bonus: ₹2,50,000 | ESOPs: ₹4,00,000\nLocation: Bengaluru Tech Center", "ISSUED")]
        cursor.executemany("INSERT INTO offer_letters (id, application_id, ctc, joining_date, offer_letter_text, status) VALUES (?, ?, ?, ?, ?, ?)", offers_data)

        logs_data = [
            (1, 2, "BATCH_RESUME_ANONYMIZATION_PII_STRIPPED", 1),
            (2, 2, "TF_IDF_DETERMINISTIC_RANKING_TRIGGERED", 1),
            (3, 3, "GEMINI_INTERVIEW_PROBE_GENERATION", 1),
            (4, 1, "FOUR_FIFTHS_EEOC_BIAS_VERIFICATION_AUDIT", 1),
        ]
        cursor.executemany("INSERT INTO system_audit_logs (id, user_id, action_type, anonymization_verified) VALUES (?, ?, ?, ?)", logs_data)

        conn.commit()
        logger.info("SQLite database initialized and seeded successfully.")


def get_sqlite_connection() -> sqlite3.Connection:
    """Returns a thread-local SQLite connection with Row factory and WAL mode."""
    if not hasattr(_thread_local, "sqlite_conn") or _thread_local.sqlite_conn is None:
        conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        _init_sqlite_database(conn)
        _thread_local.sqlite_conn = conn
    return _thread_local.sqlite_conn


# =============================================================================
# ENGINE SELECTION & POOL INITIALIZATION
# =============================================================================

def get_engine() -> str:
    """Detects and returns active database engine ('mysql' or 'sqlite')."""
    global _active_engine
    if _active_engine is not None:
        return _active_engine

    if DB_ENGINE == "sqlite":
        _active_engine = "sqlite"
        logger.info(f"Using SQLite engine explicitly: {SQLITE_DB_PATH}")
        return _active_engine

    # Try MySQL if auto or mysql
    try:
        import mysql.connector
        from mysql.connector import errorcode, pooling

        logger.info(f"Probing MySQL connection at {DB_HOST}:{DB_PORT} (db='{DB_NAME}')...")
        test_cnx = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            port=DB_PORT,
            connection_timeout=2,
        )
        test_cnx.close()
        _active_engine = "mysql"
        logger.info("MySQL connection verified. Active engine: MySQL.")
    except Exception as err:
        if DB_ENGINE == "mysql":
            logger.error(f"MySQL required by DB_ENGINE=mysql but failed: {err}")
            raise
        logger.info(f"MySQL not reachable ({err}). Seamlessly activating zero-config SQLite persistence ({SQLITE_DB_PATH}).")
        _active_engine = "sqlite"

    return _active_engine


def get_pool():
    """Initializes and returns MySQLConnectionPool if MySQL is active."""
    global _mysql_pool
    engine = get_engine()
    if engine != "mysql":
        return None

    if _mysql_pool is None:
        from mysql.connector import pooling
        _mysql_pool = pooling.MySQLConnectionPool(
            pool_name="hiresmart_pool",
            pool_size=DB_POOL_SIZE,
            pool_reset_session=True,
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            port=DB_PORT,
            autocommit=False,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
        )
    return _mysql_pool


def get_connection():
    """Acquires a connection from the active engine."""
    engine = get_engine()
    if engine == "mysql":
        pool = get_pool()
        return pool.get_connection()
    return get_sqlite_connection()


# =============================================================================
# CONTEXT MANAGER & QUERY EXECUTION
# =============================================================================

@contextmanager
def get_db(dictionary: bool = True) -> Generator[Tuple[Any, Any], None, None]:
    """
    Thread-safe context manager for database operations with automatic transactions.
    Supports both MySQL (dictionary cursor) and SQLite (Row factory dict mapping).
    """
    engine = get_engine()

    if engine == "mysql":
        conn = None
        cursor = None
        try:
            conn = get_connection()
            conn.autocommit = False
            cursor = conn.cursor(dictionary=dictionary)
            yield conn, cursor
            conn.commit()
        except Exception as e:
            if conn:
                try:
                    conn.rollback()
                except Exception:
                    pass
            raise e
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
    else:
        conn = get_sqlite_connection()
        conn.row_factory = sqlite3.Row if dictionary else None
        cursor = conn.cursor()
        try:
            yield conn, cursor
            conn.commit()
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            raise e
        finally:
            try:
                cursor.close()
            except Exception:
                pass


def execute_query(
    sql: str,
    params: Optional[Union[Tuple[Any, ...], List[Any], Dict[str, Any]]] = None,
    fetchone: bool = False,
    fetchall: bool = False,
    commit: bool = False,
    dictionary: bool = True,
) -> Any:
    """
    Typed, reusable query execution helper with transaction support and parameterized inputs.
    Automatically translates %s placeholders for SQLite compatibility while preserving MySQL support.
    """
    engine = get_engine()

    # Translate parameter placeholders if SQLite
    formatted_sql = sql
    if engine == "sqlite":
        formatted_sql = sql.replace("%s", "?")

    with get_db(dictionary=dictionary) as (conn, cursor):
        cursor.execute(formatted_sql, params or ())

        if fetchone:
            row = cursor.fetchone()
            if row is not None and engine == "sqlite" and dictionary:
                return dict(row)
            return row

        if fetchall:
            rows = cursor.fetchall()
            if engine == "sqlite" and dictionary and rows:
                return [dict(r) for r in rows]
            return rows

        if commit:
            return cursor.lastrowid if cursor.lastrowid else cursor.rowcount

        return None
