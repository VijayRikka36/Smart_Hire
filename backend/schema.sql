-- =============================================================================
-- HireSmart AI - Relational Database Schema & Initial Seed Data
-- Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- Schema: hiresmart_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hiresmart_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hiresmart_db;

-- Disable foreign key checks during table setup
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('CANDIDATE', 'RECRUITER', 'INTERVIEWER', 'ADMIN') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. COMPANIES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. COLLEGES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS colleges;
CREATE TABLE colleges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    tier VARCHAR(50),
    tpo_contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. COLLEGE DRIVES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS college_drives;
CREATE TABLE college_drives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    college_id INT,
    drive_name VARCHAR(255) NOT NULL,
    drive_date DATE,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drive_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_drive_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    INDEX idx_drive_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. CANDIDATES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS candidates;
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    college_name VARCHAR(255),
    cgpa DECIMAL(3, 2),
    phone VARCHAR(50),
    degree VARCHAR(255),
    extracted_skills TEXT,
    raw_resume_text LONGTEXT,
    resume_file_path VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_candidate_cgpa (cgpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. JOB POSTINGS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS job_postings;
CREATE TABLE job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drive_id INT NULL,
    recruiter_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills TEXT,
    min_cgpa DECIMAL(3, 2) DEFAULT 7.00,
    openings INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_drive FOREIGN KEY (drive_id) REFERENCES college_drives(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_job_min_cgpa (min_cgpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. APPLICATIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    ai_match_score DECIMAL(5, 2) DEFAULT NULL,
    status ENUM('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'OFFERED', 'ACCEPTED') DEFAULT 'APPLIED',
    coding_score INT DEFAULT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    CONSTRAINT uq_candidate_job UNIQUE (job_id, candidate_id),
    INDEX idx_app_status (status),
    INDEX idx_app_match_score (ai_match_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. INTERVIEWS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS interviews;
CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNIQUE NOT NULL,
    interviewer_id INT NULL,
    scheduled_at DATETIME,
    generated_questions JSON,
    technical_rating INT DEFAULT NULL,
    communication_rating INT DEFAULT NULL,
    problem_solving_rating INT DEFAULT NULL,
    feedback_notes TEXT,
    candidate_feedback_report TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_interviewer FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_interview_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. OFFER LETTERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS offer_letters;
CREATE TABLE offer_letters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNIQUE NOT NULL,
    ctc VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL,
    offer_letter_text LONGTEXT,
    status ENUM('ISSUED', 'ACCEPTED', 'DECLINED') DEFAULT 'ISSUED',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offer_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_offer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. SYSTEM AUDIT LOGS TABLE (Zero-Bias & Fairness Verification)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS system_audit_logs;
CREATE TABLE system_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action_type VARCHAR(255) NOT NULL,
    anonymization_verified BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_action (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SEED DATA (For Immediate Demonstration and Frontend Integration)
-- All users are seeded with standard bcrypt hash for password: 'Password123!'
-- Hash: $2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm
-- Note for production: Change passwords and generate unique hashes via passlib.
-- =============================================================================

-- 1. Seed Users (1 Admin, 1 Recruiter, 1 Interviewer, 5 Candidates)
INSERT INTO users (id, name, email, role, password_hash) VALUES
(1, 'Vikram Malhotra', 'vikram.malhotra@hiresmart.ai', 'ADMIN', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(2, 'Sarah Jenkins', 'sarah.jenkins@hiresmart.ai', 'RECRUITER', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(3, 'Dr. Priya Nair', 'priya.nair@hiresmart.ai', 'INTERVIEWER', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(4, 'Aarav Sharma', 'aarav.sharma@campus.iitb.ac.in', 'CANDIDATE', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(5, 'Sneha Kulkarni', 'sneha.k@pilani.bits-pilani.ac.in', 'CANDIDATE', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(6, 'Rohan Deshmukh', 'rohan.d@nitt.edu', 'CANDIDATE', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(7, 'Ananya Roy', 'ananya.roy@dtu.ac.in', 'CANDIDATE', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm'),
(8, 'Vikramaditya Rao', 'vikram.rao@iiit.ac.in', 'CANDIDATE', '$2b$12$K1.J9oZ8/nKqPqjS/9ySDe5M69XzH56WwU4014y0i5iR6G59/6oqm');

-- 2. Seed Companies (1 Primary Tech Employer)
INSERT INTO companies (id, name, industry, website) VALUES
(1, 'HireSmart Technologies India Pvt. Ltd.', 'Enterprise AI & Cloud Infrastructure', 'https://hiresmart.ai');

-- 3. Seed Colleges (2 Premier Engineering Institutes)
INSERT INTO colleges (id, name, location, tier, tpo_contact_email) VALUES
(1, 'Indian Institute of Technology (IIT) Bombay', 'Mumbai, Maharashtra', 'Tier 1', 'placements@iitb.ac.in'),
(2, 'Birla Institute of Technology and Science (BITS) Pilani', 'Pilani, Rajasthan', 'Tier 1', 'tpo@pilani.bits-pilani.ac.in');

-- 4. Seed College Drives (1 Active Pan-Campus Drive)
INSERT INTO college_drives (id, company_id, college_id, drive_name, drive_date, status) VALUES
(1, 1, 1, 'Pan-India Tier-1 University Engineering Placement Drive 2026', '2026-11-15', 'ACTIVE'),
(2, 1, 2, 'BITS Autonomous AI & Cloud Specialist Drive 2026', '2026-11-20', 'UPCOMING');

-- 5. Seed Candidates (5 profiles linked to user accounts 4-8)
INSERT INTO candidates (id, user_id, college_name, cgpa, phone, degree, extracted_skills, raw_resume_text, resume_file_path) VALUES
(1, 4, 'Indian Institute of Technology (IIT) Bombay', 9.24, '+91 98765 43210', 'B.Tech in Computer Science & Engineering', 
 'Python, PyTorch, LangChain, FastAPI, Docker, Vector DBs, C++, System Design', 
 '[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech CSE, IIT Bombay, CGPA: 9.24\nSkills: Python, PyTorch, LangChain, FastAPI, Docker, Vector DBs, C++, Git\nProjects: Distributed RAG Engine for Legal Discovery with Pinecone and FastAPI; Multi-Agent Code Reviewer with CodeLlama 7B.', 
 './uploads/aarav_sharma_resume.pdf'),

(2, 5, 'BITS Pilani', 8.86, '+91 98111 22334', 'B.E. in Computer Science', 
 'React, TypeScript, Node.js, PostgreSQL, Docker, AWS, GraphQL, TailwindCSS', 
 '[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.E. Computer Science, BITS Pilani, CGPA: 8.86\nSkills: React, TypeScript, Node.js, PostgreSQL, Docker, AWS, GraphQL, REST APIs\nProjects: Real-time Collaborative Canvas using CRDTs and WebSockets; Multi-tenant SaaS billing platform.', 
 './uploads/sneha_kulkarni_resume.pdf'),

(3, 6, 'NIT Trichy', 8.62, '+91 97234 56789', 'B.Tech in Information Technology', 
 'Python, TensorFlow, Scikit-learn, SQL, FastAPI, Pandas, NumPy', 
 '[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech IT, NIT Trichy, CGPA: 8.62\nSkills: Python, TensorFlow, Scikit-learn, SQL, FastAPI, Pandas, Data Engineering\nProjects: Mobile plant leaf disease classifier using PyTorch ResNet; Real-time traffic anomaly detection.', 
 './uploads/rohan_deshmukh_resume.pdf'),

(4, 7, 'Delhi Technological University (DTU)', 9.45, '+91 99000 88776', 'B.Tech in Software Engineering', 
 'Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, Raft', 
 '[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: B.Tech Software Engineering, DTU, CGPA: 9.45\nSkills: Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, Microservices\nProjects: Distributed streaming transaction ledger with Raft consensus; Real-time financial event telemetry pipeline.', 
 './uploads/ananya_roy_resume.pdf'),

(5, 8, 'IIIT Hyderabad', 8.91, '+91 91234 56780', 'Dual Degree B.Tech + M.S. in CSE', 
 'Python, PyTorch, Transformers, CUDA, Triton, C++, Linux', 
 '[REDACTED_EMAIL] | [REDACTED_PHONE]\nEducation: Dual Degree CSE, IIIT Hyderabad, CGPA: 8.91\nSkills: Python, PyTorch, Transformers, CUDA, Triton, C++, Low-level Systems\nProjects: Low-bit quantized attention kernel on CUDA; Distributed tensor parallelism benchmark on 8x A100 GPUs.', 
 './uploads/vikramaditya_rao_resume.pdf');

-- 6. Seed Job Postings (3 Mock Requisitions under Active Drive 1)
INSERT INTO job_postings (id, drive_id, recruiter_id, title, description, required_skills, min_cgpa, openings) VALUES
(1, 1, 2, 'Associate AI/ML Engineer (GenAI Core)', 
 'Design enterprise retrieval-augmented pipelines, fine-tune multimodal LLMs, and build high-throughput GPU inference microservices.', 
 'Python, PyTorch, Transformers, LangChain, Vector DBs, FastAPI, Docker', 8.00, 15),

(2, 1, 2, 'Full Stack Cloud Developer', 
 'Develop robust, low-latency web applications and cloud microservices utilizing modern reactive frameworks and containerized deployments.', 
 'React, TypeScript, Node.js, PostgreSQL, Docker, AWS, REST APIs', 7.50, 25),

(3, 1, 2, 'Data Platform & Distributed Systems Engineer', 
 'Architect fault-tolerant streaming pipelines processing terabytes of real-time telemetry and candidate event streams.', 
 'Go, Python, Apache Spark, Kafka, PostgreSQL, Kubernetes, System Design', 7.20, 12);

-- 7. Seed Applications (Connecting candidates to jobs)
INSERT INTO applications (id, job_id, candidate_id, ai_match_score, status, coding_score) VALUES
(1, 1, 1, 94.50, 'INTERVIEW_SCHEDULED', 92),
(2, 2, 2, 89.00, 'SHORTLISTED', 88),
(3, 1, 3, 76.50, 'APPLIED', 78),
(4, 3, 4, 96.00, 'OFFERED', 98),
(5, 1, 5, 92.50, 'SHORTLISTED', 94);

-- 8. Seed Interviews
INSERT INTO interviews (id, application_id, interviewer_id, scheduled_at, generated_questions, technical_rating, communication_rating, problem_solving_rating, feedback_notes, candidate_feedback_report, status) VALUES
(1, 1, 3, '2026-11-04 14:30:00', 
 '[{"id": 1, "topic": "RAG Systems", "question": "How do you mitigate context fragmentation and lost-in-the-middle phenomena in dense vector retrieval?", "what_to_look_for": "Semantic chunking and contextual re-ranking"}]',
 NULL, NULL, NULL, NULL, NULL, 'SCHEDULED'),

(2, 4, 3, '2026-10-25 11:00:00',
 '[{"id": 1, "topic": "Consensus", "question": "Walk through Raft leader election failure recovery.", "what_to_look_for": "Quorum counts and term numbers"}]',
 5, 5, 5, 'Mastery of distributed consensus and goroutines. Strong hire.', 
 'Candidate demonstrated rare architectural maturity for an undergraduate. Immediate strong hire recommendation.', 'COMPLETED');

-- 9. Seed Offer Letters (For Application 4 - Ananya Roy)
INSERT INTO offer_letters (id, application_id, ctc, joining_date, offer_letter_text, status) VALUES
(1, 4, '₹24,50,000 CTC', '2026-07-01', 
 'Official Letter of Employment\nCandidate: Ananya Roy\nRole: Data Platform & Distributed Systems Engineer\nFixed Base: ₹18,00,000 | Joining Bonus: ₹2,50,000 | ESOPs: ₹4,00,000\nLocation: Bengaluru Tech Center', 
 'ISSUED');

-- 10. Seed System Audit Logs (Verification of Demographic Blinding)
INSERT INTO system_audit_logs (id, user_id, action_type, anonymization_verified) VALUES
(1, 2, 'BATCH_RESUME_ANONYMIZATION_PII_STRIPPED', TRUE),
(2, 2, 'TF_IDF_DETERMINISTIC_RANKING_TRIGGERED', TRUE),
(3, 3, 'GEMINI_INTERVIEW_PROBE_GENERATION', TRUE),
(4, 1, 'FOUR_FIFTHS_EEOC_BIAS_VERIFICATION_AUDIT', TRUE);
