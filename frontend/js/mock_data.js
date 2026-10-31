/**
 * HireSmart AI – Mock Datasets & State Store
 * Provides persistent local state for live demonstrations with 15,000 synthetic funnel metrics,
 * candidate profiles, active campus job drives, and AI evaluation question banks.
 */

const HireSmartStore = (function () {
  const STORAGE_KEYS = {
    CANDIDATES: 'hiresmart_candidates_v1',
    JOBS: 'hiresmart_jobs_v1',
    COLLEGES: 'hiresmart_colleges_v1',
    METRICS: 'hiresmart_metrics_v1',
    CURRENT_USER: 'hiresmart_current_user_v1',
    AUDIT_LOGS: 'hiresmart_audit_logs_v1',
    DEMO_SEEDED: 'hiresmart_seeded_v1'
  };

  // 15,000 synthetic recruitment funnel baseline
  const defaultMetrics = {
    totalResumes: 15000,
    aiScreenPassed: 3200,
    interviewsCompleted: 650,
    offersExtended: 300,
    avgScreeningTimeHours: 1.4,
    diversityParityIndex: 0.992,
    stages: [
      {
        stageName: 'Applications Sourced',
        count: 15000,
        conversionRate: 100,
        overallYield: 100,
        dropoffCount: 0,
        status: 'Optimal',
        bottleneckAlert: null
      },
      {
        stageName: 'AI Resume Screen Passed',
        count: 3200,
        conversionRate: 21.33,
        overallYield: 21.33,
        dropoffCount: 11800,
        status: 'Optimal',
        bottleneckAlert: 'Standard high-volume filtering: 78.6% filtered by core requirements & CGPA baseline.'
      },
      {
        stageName: 'Interviews Scheduled',
        count: 950,
        conversionRate: 29.69,
        overallYield: 6.33,
        dropoffCount: 2250,
        status: 'Warning',
        bottleneckAlert: 'Interviewer Capacity Bottleneck: 2,250 shortlisted candidates pending available interviewer calendar slots.'
      },
      {
        stageName: 'Interviews Completed',
        count: 650,
        conversionRate: 68.42,
        overallYield: 4.33,
        dropoffCount: 300,
        status: 'Moderate',
        bottleneckAlert: '31.5% drop-off attributable to schedule conflicts, campus exam clashes, and candidate declines.'
      },
      {
        stageName: 'Offers Extended',
        count: 300,
        conversionRate: 46.15,
        overallYield: 2.00,
        dropoffCount: 350,
        status: 'Optimal',
        bottleneckAlert: null
      }
    ]
  };

  const defaultJobs = [
    {
      id: 'JOB-101',
      title: 'Associate AI/ML Engineer (GenAI Core)',
      department: 'AI Research & Platform',
      openings: 15,
      minCgpa: 8.0,
      location: 'Bengaluru / Hybrid',
      driveDate: '2026-11-15',
      requiredSkills: ['Python', 'PyTorch', 'Transformers', 'LangChain', 'Vector DBs', 'FastAPI'],
      description: 'Build cutting-edge enterprise LLM agents, retrieval-augmented pipelines, and fine-tune multimodal foundation models.',
      applicantsCount: 4280,
      status: 'Active'
    },
    {
      id: 'JOB-102',
      title: 'Full Stack Cloud Developer',
      department: 'Product Engineering',
      openings: 25,
      minCgpa: 7.5,
      location: 'Hyderabad / On-site',
      driveDate: '2026-11-18',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      description: 'Develop high-throughput, low-latency web interfaces and microservices powering the core SaaS suite.',
      applicantsCount: 5120,
      status: 'Active'
    },
    {
      id: 'JOB-103',
      title: 'Data Platform & Distributed Systems Engineer',
      department: 'Data Infrastructure',
      openings: 12,
      minCgpa: 7.2,
      location: 'Pune / Hybrid',
      driveDate: '2026-11-22',
      requiredSkills: ['Python', 'Apache Spark', 'SQL', 'Kafka', 'Snowflake', 'Go'],
      description: 'Design distributed streaming architectures processing terabytes of real-time telemetry and candidate event streams.',
      applicantsCount: 2840,
      status: 'Active'
    },
    {
      id: 'JOB-104',
      title: 'DevSecOps & Platform Reliability Engineer',
      department: 'Cloud Infrastructure',
      openings: 8,
      minCgpa: 7.0,
      location: 'Bengaluru / Remote',
      driveDate: '2026-11-28',
      requiredSkills: ['Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Go', 'AWS'],
      description: 'Automate multi-region Kubernetes deployments, maintain zero-trust security postures, and build automated observability.',
      applicantsCount: 1680,
      status: 'Active'
    },
    {
      id: 'JOB-105',
      title: 'Associate Product Solutions Consultant',
      department: 'Customer Engineering',
      openings: 10,
      minCgpa: 7.0,
      location: 'Gurugram / On-site',
      driveDate: '2026-12-05',
      requiredSkills: ['JavaScript', 'Python', 'REST APIs', 'SQL', 'System Architecture'],
      description: 'Bridge deep engineering capabilities with enterprise customer integrations and custom AI workflows.',
      applicantsCount: 1080,
      status: 'Upcoming'
    }
  ];

  const defaultCandidates = [
    {
      id: 'CAND-001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.iitb.ac.in',
      phone: '+91 98765 43210',
      college: 'Indian Institute of Technology (IIT) Bombay',
      degree: 'B.Tech in Computer Science & Engineering',
      cgpa: 9.24,
      passingYear: 2026,
      targetRole: 'Associate AI/ML Engineer (GenAI Core)',
      extractedSkills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Docker', 'Vector DBs', 'C++'],
      projects: [
        {
          name: 'Distributed RAG Engine for Legal Discovery',
          tech: 'Python, Pinecone, LangChain, FastAPI',
          summary: 'Built sub-100ms semantic retrieval across 500k contract clauses with hybrid BM25 + dense embedding re-ranking.'
        },
        {
          name: 'Multi-Agent Autonomous Code Reviewer',
          tech: 'PyTorch, Transformers, vLLM',
          summary: 'Fine-tuned CodeLlama 7B on security vulnerabilities; achieved 34% higher detection precision than standard linters.'
        }
      ],
      aiMatchScore: 94,
      recommendation: 'High Fit',
      status: 'Interview Scheduled',
      applicationDate: '2026-10-18',
      appliedJobId: 'JOB-101',
      interview: {
        date: '2026-11-04',
        time: '14:30 IST',
        interviewer: 'Dr. Priya Nair (Principal AI Architect)',
        round: 'Technical Deep Dive & GenAI Architecture',
        meetLink: 'https://meet.hiresmart.ai/room/interview-8492'
      },
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-002',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@pilani.bits-pilani.ac.in',
      phone: '+91 98111 22334',
      college: 'BITS Pilani',
      degree: 'B.E. in Computer Science',
      cgpa: 8.86,
      passingYear: 2026,
      targetRole: 'Full Stack Cloud Developer',
      extractedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
      projects: [
        {
          name: 'Real-time Collaborative Canvas',
          tech: 'React, WebSockets, Node.js, Redis',
          summary: 'CRDT-based canvas supporting 100 concurrent peer editors with zero conflict latency.'
        }
      ],
      aiMatchScore: 89,
      recommendation: 'High Fit',
      status: 'Shortlisted',
      applicationDate: '2026-10-19',
      appliedJobId: 'JOB-102',
      interview: null,
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-003',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@nitt.edu',
      phone: '+91 97234 56789',
      college: 'NIT Trichy',
      degree: 'B.Tech in Information Technology',
      cgpa: 8.62,
      passingYear: 2026,
      targetRole: 'Associate AI/ML Engineer (GenAI Core)',
      extractedSkills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL', 'FastAPI', 'Pandas'],
      projects: [
        {
          name: 'Autonomous Crop Disease Classifier',
          tech: 'PyTorch, ResNet, OpenCV, Flask',
          summary: 'Mobile-first edge inference model diagnosing 14 plant leaf pathogens with 96.2% F1 score.'
        }
      ],
      aiMatchScore: 82,
      recommendation: 'Moderate Fit',
      status: 'Screened',
      applicationDate: '2026-10-20',
      appliedJobId: 'JOB-101',
      interview: null,
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-004',
      name: 'Ananya Roy',
      email: 'ananya.roy@dtu.ac.in',
      phone: '+91 99000 88776',
      college: 'Delhi Technological University (DTU)',
      degree: 'B.Tech in Software Engineering',
      cgpa: 9.45,
      passingYear: 2026,
      targetRole: 'Data Platform & Distributed Systems Engineer',
      extractedSkills: ['Go', 'Python', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Kubernetes'],
      projects: [
        {
          name: 'Distributed Stream Ledger',
          tech: 'Go, Raft Consensus, gRPC',
          summary: 'Implemented a fault-tolerant log replicating 40,000 tx/sec with quorum failure recovery in <200ms.'
        }
      ],
      aiMatchScore: 96,
      recommendation: 'High Fit',
      status: 'Offered',
      applicationDate: '2026-10-15',
      appliedJobId: 'JOB-103',
      interview: {
        date: '2026-10-25',
        time: '11:00 IST',
        interviewer: 'Rajesh Verma (VP of Infrastructure)',
        round: 'Distributed Systems & Architecture',
        meetLink: 'https://meet.hiresmart.ai/room/interview-7102'
      },
      scorecard: {
        techRating: 5,
        problemSolving: 5,
        commRating: 4,
        notes: 'Exceptional mastery of Raft consensus and concurrent goroutines. Solved streaming backpressure with clean sliding-window solution.',
        feedbackDraft: 'Candidate demonstrated rare architectural maturity for an undergraduate. Immediate strong hire.'
      },
      offerDetails: {
        role: 'Data Platform & Distributed Systems Engineer',
        ctc: '₹24,50,000 CTC',
        baseSalary: '₹18,00,000',
        joiningBonus: '₹2,50,000',
        stockOptions: '₹4,00,000 ESOPs (vested over 4 years)',
        location: 'Bengaluru Tech Center',
        joiningDate: '2026-07-01',
        offerDate: '2026-10-28',
        expiresDate: '2026-11-15',
        status: 'Extended'
      }
    },
    {
      id: 'CAND-005',
      name: 'Vikramaditya Rao',
      email: 'vikram.rao@iiit.ac.in',
      phone: '+91 91234 56780',
      college: 'IIIT Hyderabad',
      degree: 'Dual Degree B.Tech + M.S. in CSE',
      cgpa: 8.91,
      passingYear: 2026,
      targetRole: 'Associate AI/ML Engineer (GenAI Core)',
      extractedSkills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'Triton', 'C++'],
      projects: [
        {
          name: 'Low-Bit Quantized Attention Kernel',
          tech: 'CUDA, Triton, PyTorch',
          summary: 'Achieved 2.3x speedup on FlashAttention-2 for 4-bit quantized KV-cache on RTX 4090.'
        }
      ],
      aiMatchScore: 92,
      recommendation: 'High Fit',
      status: 'Interview Scheduled',
      applicationDate: '2026-10-17',
      appliedJobId: 'JOB-101',
      interview: {
        date: '2026-11-04',
        time: '16:00 IST',
        interviewer: 'Dr. Priya Nair (Principal AI Architect)',
        round: 'AI Systems & GPU Kernels',
        meetLink: 'https://meet.hiresmart.ai/room/interview-8495'
      },
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-006',
      name: 'Tanvi Saxena',
      email: 'tanvi.s@rvce.edu.in',
      phone: '+91 94567 12345',
      college: 'RV College of Engineering',
      degree: 'B.E. in Information Science',
      cgpa: 7.65,
      passingYear: 2026,
      targetRole: 'DevSecOps & Platform Reliability Engineer',
      extractedSkills: ['Docker', 'Kubernetes', 'Linux', 'Terraform', 'Bash', 'GitHub Actions'],
      projects: [
        {
          name: 'Zero-Trust GitOps Pipeline',
          tech: 'ArgoCD, Vault, Kubernetes, Terraform',
          summary: 'Designed automated secret rotation and signature verification for all container image promotions.'
        }
      ],
      aiMatchScore: 78,
      recommendation: 'Moderate Fit',
      status: 'Screened',
      applicationDate: '2026-10-21',
      appliedJobId: 'JOB-104',
      interview: null,
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-007',
      name: 'Aditya Sen',
      email: 'aditya.sen@jaduniv.edu.in',
      phone: '+91 93345 67890',
      college: 'Jadavpur University',
      degree: 'B.E. in Computer Science',
      cgpa: 8.42,
      passingYear: 2026,
      targetRole: 'Full Stack Cloud Developer',
      extractedSkills: ['Vue.js', 'Node.js', 'MongoDB', 'Express', 'TailwindCSS'],
      projects: [
        {
          name: 'Micro-SaaS Invoicing Engine',
          tech: 'Node.js, Stripe, MongoDB',
          summary: 'Multi-tenant subscription manager handling recurring webhooks with automated reconciliation.'
        }
      ],
      aiMatchScore: 74,
      recommendation: 'Moderate Fit',
      status: 'Applied',
      applicationDate: '2026-10-22',
      appliedJobId: 'JOB-102',
      interview: null,
      scorecard: null,
      offerDetails: null
    },
    {
      id: 'CAND-008',
      name: 'Meera Nambiar',
      email: 'meera.n@coep.ac.in',
      phone: '+91 98450 11223',
      college: 'College of Engineering Pune (COEP)',
      degree: 'B.Tech in Computer Engineering',
      cgpa: 6.95,
      passingYear: 2026,
      targetRole: 'Associate AI/ML Engineer (GenAI Core)',
      extractedSkills: ['Python', 'Basic SQL', 'HTML', 'CSS', 'NumPy'],
      projects: [
        {
          name: 'Movie Recommendation App',
          tech: 'Python, Flask, Scikit-learn',
          summary: 'Collaborative filtering model recommending top-10 films based on user rating history.'
        }
      ],
      aiMatchScore: 56,
      recommendation: 'Low Fit',
      status: 'Applied',
      applicationDate: '2026-10-23',
      appliedJobId: 'JOB-101',
      interview: null,
      scorecard: null,
      offerDetails: null
    }
  ];

  const defaultColleges = [
    {
      id: 'COL-001',
      name: 'Indian Institute of Technology (IIT) Bombay',
      tier: 'Tier 1',
      targetBatch: 'Batch 2026',
      driveDate: '2026-11-12',
      registeredCount: 1420,
      recruiterLead: 'Sarah Jenkins',
      status: 'Active'
    },
    {
      id: 'COL-002',
      name: 'BITS Pilani (Pilani, Goa, Hyderabad)',
      tier: 'Tier 1',
      targetBatch: 'Batch 2026',
      driveDate: '2026-11-16',
      registeredCount: 1980,
      recruiterLead: 'Sarah Jenkins',
      status: 'Active'
    },
    {
      id: 'COL-003',
      name: 'NIT Trichy & NIT Surathkal',
      tier: 'Tier 1',
      targetBatch: 'Batch 2026',
      driveDate: '2026-11-20',
      registeredCount: 2240,
      recruiterLead: 'Amitabh Sharma',
      status: 'Upcoming'
    },
    {
      id: 'COL-004',
      name: 'Delhi Technological University (DTU)',
      tier: 'Tier 1',
      targetBatch: 'Batch 2026',
      driveDate: '2026-11-25',
      registeredCount: 1750,
      recruiterLead: 'Sarah Jenkins',
      status: 'Upcoming'
    },
    {
      id: 'COL-005',
      name: 'IIIT Hyderabad',
      tier: 'Tier 1',
      targetBatch: 'Batch 2026',
      driveDate: '2026-11-02',
      registeredCount: 960,
      recruiterLead: 'Amitabh Sharma',
      status: 'Active'
    },
    {
      id: 'COL-006',
      name: 'RV College of Engineering & PES University',
      tier: 'Tier 2',
      targetBatch: 'Batch 2026',
      driveDate: '2026-12-04',
      registeredCount: 3100,
      recruiterLead: 'Kavita Menon',
      status: 'Upcoming'
    },
    {
      id: 'COL-007',
      name: 'Vellore Institute of Technology (VIT)',
      tier: 'Tier 2',
      targetBatch: 'Batch 2026',
      driveDate: '2026-10-10',
      registeredCount: 3550,
      recruiterLead: 'Kavita Menon',
      status: 'Completed'
    }
  ];

  const defaultAuditLogs = [
    {
      timestamp: '2026-10-31 09:14 IST',
      event: 'Demographic Marker Stripping',
      scope: '15,000 Incoming Batch Profiles',
      details: 'All PII (Gender, religion, surname proxies, photos, residential pincodes) blinded before LLM tokenization.',
      status: '100% Blinded',
      verifiedBy: 'AI Fairness Engine v3.1'
    },
    {
      timestamp: '2026-10-30 18:20 IST',
      event: 'Disparate Impact Ratio Evaluation',
      scope: 'Active Ranking Algorithm',
      details: 'Adverse Impact Ratio measured at 0.992 across gender groups. Well above the EEOC four-fifths (0.80) standard.',
      status: 'Compliant',
      verifiedBy: 'Algorithmic Compliance Auditor'
    },
    {
      timestamp: '2026-10-29 14:05 IST',
      event: 'College Tier Weight Normalization',
      scope: 'Scoring Weights Engine',
      details: 'Normalized project complexity and verified algorithmic contributions over institutional pedigree bias.',
      status: 'Enforced',
      verifiedBy: 'Evaluation Governor'
    },
    {
      timestamp: '2026-10-28 11:42 IST',
      event: 'Adversarial Prompt Injection Probe',
      scope: 'Gemini Interview Generator',
      details: '0/500 prompt penetration test vectors succeeded in biasing question generation or leaking rubric cues.',
      status: 'Secure',
      verifiedBy: 'Red Team AI Unit'
    }
  ];

  // Gemini Interview Question Generation Bank
  const geminiQuestionTemplates = {
    'AI/ML': [
      {
        topic: 'LLM Architecture & Retrieval (RAG)',
        difficulty: 'Advanced',
        question: 'In your distributed RAG engine, how do you solve the "lost in the middle" phenomenon when feeding top-k vector chunks into the context window, and how do you evaluate hallucination rates systematically?',
        whatToListenFor: [
          'Mention of contextual re-ranking (Cohere Rerank, BGE-reranker) to prioritize salient chunks at window edges.',
          'Understanding of RAG Triad metrics (Context Relevance, Groundedness, Answer Relevance) using frameworks like Ragas or TruLens.',
          'Handling chunk boundaries without truncating key sentence semantics using semantic chunking.'
        ],
        followUp: 'How would you implement hybrid lexical (BM25) and dense vector retrieval with Reciprocal Rank Fusion (RRF)?'
      },
      {
        topic: 'Model Quantization & Inference Efficiency',
        difficulty: 'Advanced',
        question: 'When deploying a 7B or 14B parameter foundation model for real-time inference with SLA < 150ms, what memory tradeoffs exist between AWQ, GPTQ, and FP8, and how does KV-cache paging reduce memory fragmentation?',
        whatToListenFor: [
          'Differentiating weight-only quantization (AWQ/GPTQ) vs activation quantization (FP8 / SmoothQuant).',
          'Deep explanation of vLLM PagedAttention inspired by OS virtual memory pages to eliminate continuous physical allocation.',
          'Understanding continuous batching vs static batching.'
        ],
        followUp: 'What are the risks of activation outliers in high-throughput production workloads?'
      },
      {
        topic: 'Vector DBs & High-Dimensional Indexing',
        difficulty: 'Intermediate',
        question: 'Compare HNSW (Hierarchical Navigable Small World) graphs with IVF-PQ (Inverted File with Product Quantization) regarding query latency, recall accuracy, and memory footprint.',
        whatToListenFor: [
          'HNSW provides higher recall and lower latency but consumes substantial RAM for graphs.',
          'IVF-PQ compresses vectors into byte codes via centroids, ideal for multi-million vector scale on limited memory.',
          'Tradeoffs when updating dynamic indices vs static indices.'
        ],
        followUp: 'What distance metric is optimal when vectors are normalized vs unnormalized?'
      },
      {
        topic: 'System Failure Recovery & Guardrails',
        difficulty: 'Intermediate',
        question: 'Describe how you build programmatic guardrails to catch prompt injections, jailbreaks, and sensitive data leakage before responses reach an enterprise end-user.',
        whatToListenFor: [
          'Dual-layer validation: Input sanitization (regex + lightweight classifier) and Output evaluation (Llama Guard / NeMo Guardrails).',
          'Structured JSON schema enforcement using tool-calling or constrained sampling (Outlines / Guidance).',
          'Fail-safe graceful fallback when the model encounters toxic input.'
        ],
        followUp: 'How do you monitor for semantic drift in user queries over time?'
      },
      {
        topic: 'Engineering Collaboration & Code Quality',
        difficulty: 'Behavioral',
        question: 'Tell me about a time in your academic or open-source projects where a peer proposed an architecture that you believed was technically flawed. How did you provide constructive technical feedback without alienating them?',
        whatToListenFor: [
          'Objective benchmark-driven data over subjective opinion.',
          'Empathy and collaborative reframing ("How does this handle edge case X?").',
          'Willingness to build small proof-of-concept spikes to test both hypotheses.'
        ],
        followUp: 'What was the eventual compromise reached?'
      }
    ],
    'FullStack': [
      {
        topic: 'State Synchronization & CRDTs',
        difficulty: 'Advanced',
        question: 'In your real-time collaborative canvas project, walk me through how you handled concurrent updates from two disconnected users editing the same object simultaneously without server-side locking.',
        whatToListenFor: [
          'Conflict-free Replicated Data Types (CRDTs) like Yjs or Automerge vs Operational Transformation (OT).',
          'Vector clocks or Lamport timestamps to establish deterministic causal ordering.',
          'Handling network reconnects and optimistic local state rollbacks.'
        ],
        followUp: 'Why might WebSockets fail under mobile network switching and how do you implement exponential backoff reconnection?'
      },
      {
        topic: 'Database Concurrency & Isolation Levels',
        difficulty: 'Intermediate',
        question: 'Explain the difference between Read Committed and Serializable isolation levels in PostgreSQL. How do you prevent phantom reads and write skew in a high-concurrency seat reservation system?',
        whatToListenFor: [
          'Understanding multi-version concurrency control (MVCC) in Postgres.',
          'Difference between dirty reads, non-repeatable reads, and write skew.',
          'SELECT ... FOR UPDATE row-level pessimistic locking vs optimistic locking with version columns.'
        ],
        followUp: 'When would an advisory lock be preferable to a table lock?'
      },
      {
        topic: 'Microservices & API Contract Design',
        difficulty: 'Intermediate',
        question: 'When designing a public API consumed by hundreds of client integrations, how do you manage versioning, idempotent requests (e.g., payment charges), and rate-limiting gracefully?',
        whatToListenFor: [
          'Idempotency keys stored in Redis with atomic SETNX and short TTL.',
          'Token bucket or sliding window counter algorithms for rate-limiting with 429 Retry-After headers.',
          'Semantic versioning and backward-compatible additive changes.'
        ],
        followUp: 'What headers do you provide to communicate rate-limit quota consumption?'
      },
      {
        topic: 'Frontend Performance & Rendering Budgets',
        difficulty: 'Intermediate',
        question: 'How do you diagnose and eliminate unnecessary re-renders in a complex React dashboard containing data tables with 5,000+ rows?',
        whatToListenFor: [
          'Windowing/virtualization using TanStack Virtual or react-window.',
          'Stable references via useMemo, useCallback, and isolating reactive state to leaf nodes.',
          'Profiling using React DevTools Flamegraph and Web Vitals (INP, LCP).'
        ],
        followUp: 'What are the tradeoffs of CSS-in-JS vs utility CSS (Tailwind) regarding runtime overhead?'
      },
      {
        topic: 'Ownership & Production Incident Response',
        difficulty: 'Behavioral',
        question: 'Describe a situation where a service you deployed crashed or malfunctioned during a live demonstration or deadline. What was your immediate response and how did you resolve it under pressure?',
        whatToListenFor: [
          'Calm, structured triage: checking logs/metrics before jumping to random code edits.',
          'Clear communication to stakeholders.',
          'Writing a blameless post-mortem with preventative tests.'
        ],
        followUp: 'What monitoring metric would have alerted you before the crash happened?'
      }
    ],
    'Distributed': [
      {
        topic: 'Consensus Protocols (Raft / Paxos)',
        difficulty: 'Advanced',
        question: 'Explain how the Raft consensus algorithm handles split-vote scenarios during leader elections, and what guarantees prevent split-brain state during network partitions.',
        whatToListenFor: [
          'Randomized election timeouts to break symmetric voting deadlocks.',
          'Quorum rule: leader must replicate log entries to a strict majority (> N/2) before committing.',
          'Term numbers ensuring stale leaders reject writes upon network heal.'
        ],
        followUp: 'How does log compaction via snapshotting prevent unbounded disk growth in Raft?'
      },
      {
        topic: 'Kafka Partitions & Consumer Rebalances',
        difficulty: 'Intermediate',
        question: 'How does Kafka guarantee message order while maintaining horizontal scalability across consumer group instances, and what happens during an "eager" vs "cooperative sticky" rebalance?',
        whatToListenFor: [
          'Ordering is strictly guaranteed within a partition, determined by record key hash.',
          'Cooperative sticky rebalance minimizes consumer group pauses by reassigning only migrating partitions.',
          'Understanding consumer group lag and commit offsets.'
        ],
        followUp: 'What causes consumer poll timeouts and poison-pill message loops?'
      },
      {
        topic: 'Data Modeling & Distributed Sharding',
        difficulty: 'Intermediate',
        question: 'When designing a distributed timeseries data platform, how do you choose a shard key to avoid hot spotting on the current timestamp while allowing efficient range queries?',
        whatToListenFor: [
          'Composite keys: tenant/device hash prefix combined with bucketed timestamp suffix.',
          'Consistent hashing with virtual nodes to distribute traffic evenly across storage nodes.',
          'Tradeoffs between write fanout and read scatter-gather queries.'
        ],
        followUp: 'How does Cassandra / Scylla handle tombstone accumulation during deletes?'
      },
      {
        topic: 'Fault Injection & Chaos Engineering',
        difficulty: 'Intermediate',
        question: 'How do you test that a distributed pipeline handles network jitter, packet loss, and asymmetric partition failures before pushing to production?',
        whatToListenFor: [
          'Chaos mesh or Toxiproxy for simulated latency and dropped packets.',
          'Idempotent consumers and dead-letter queues (DLQ) for poisoned payloads.',
          'Automated circuit breakers (e.g. Hystrix/Resilience4j concepts).'
        ],
        followUp: 'How do you verify end-to-end data integrity without slowing down streaming throughput?'
      },
      {
        topic: 'Cross-functional Alignment',
        difficulty: 'Behavioral',
        question: 'Tell me about a time you had to balance pure architectural perfection with strict deadline pressures from product management. How did you negotiate scope and technical debt?',
        whatToListenFor: [
          'Pragmatic prioritization: shipping the minimum lovable resilient version.',
          'Documenting technical debt explicitly in the backlog with risk estimations.',
          'Delivering in iterative, verifiable milestones.'
        ],
        followUp: 'Did the technical debt ever come back to cause an incident?'
      }
    ]
  };

  // Helper functions for LocalStorage management
  function getStored(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`[HireSmartStore] Failed to read ${key}:`, e);
      return fallback;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[HireSmartStore] Failed to write ${key}:`, e);
    }
  }

  // Self initialization
  function init() {
    if (!localStorage.getItem(STORAGE_KEYS.DEMO_SEEDED)) {
      setStored(STORAGE_KEYS.METRICS, defaultMetrics);
      setStored(STORAGE_KEYS.JOBS, defaultJobs);
      setStored(STORAGE_KEYS.CANDIDATES, defaultCandidates);
      setStored(STORAGE_KEYS.COLLEGES, defaultColleges);
      setStored(STORAGE_KEYS.AUDIT_LOGS, defaultAuditLogs);
      localStorage.setItem(STORAGE_KEYS.DEMO_SEEDED, 'true');
      console.log('[HireSmartStore] Initialized baseline demo state.');
    }
  }

  // Initialize immediately
  init();

  return {
    // Current logged-in user simulation
    getCurrentUser() {
      return getStored(STORAGE_KEYS.CURRENT_USER, {
        id: 'DEMO-USER-CANDIDATE',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.iitb.ac.in',
        role: 'candidate',
        roleTitle: 'Campus Candidate (Final Year CS)',
        college: 'IIT Bombay',
        candidateId: 'CAND-001'
      });
    },

    setCurrentUser(user) {
      setStored(STORAGE_KEYS.CURRENT_USER, user);
      window.dispatchEvent(new CustomEvent('hiresmart:user_changed', { detail: user }));
    },

    logout() {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = 'index.html';
    },

    // Candidates
    getCandidates() {
      return getStored(STORAGE_KEYS.CANDIDATES, defaultCandidates);
    },

    getCandidateById(id) {
      const list = this.getCandidates();
      return list.find((c) => c.id === id) || null;
    },

    saveCandidates(candidates) {
      setStored(STORAGE_KEYS.CANDIDATES, candidates);
      window.dispatchEvent(new CustomEvent('hiresmart:candidates_updated', { detail: candidates }));
    },

    updateCandidate(id, updates) {
      const list = this.getCandidates();
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        this.saveCandidates(list);
        return list[idx];
      }
      return null;
    },

    addCandidate(candidate) {
      const list = this.getCandidates();
      const newCand = {
        id: `CAND-${String(list.length + 1).padStart(3, '0')}`,
        applicationDate: new Date().toISOString().split('T')[0],
        aiMatchScore: Math.floor(Math.random() * 25) + 72,
        recommendation: 'Moderate Fit',
        status: 'Applied',
        ...candidate
      };
      if (newCand.aiMatchScore >= 85) newCand.recommendation = 'High Fit';
      else if (newCand.aiMatchScore < 70) newCand.recommendation = 'Low Fit';

      list.unshift(newCand);
      this.saveCandidates(list);
      return newCand;
    },

    // Jobs
    getJobs() {
      return getStored(STORAGE_KEYS.JOBS, defaultJobs);
    },

    addJob(job) {
      const list = this.getJobs();
      const newJob = {
        id: `JOB-${list.length + 101}`,
        applicantsCount: 0,
        status: 'Active',
        ...job
      };
      list.unshift(newJob);
      setStored(STORAGE_KEYS.JOBS, list);
      window.dispatchEvent(new CustomEvent('hiresmart:jobs_updated', { detail: list }));
      return newJob;
    },

    incrementJobApplicant(jobId) {
      const list = this.getJobs();
      const job = list.find((j) => j.id === jobId);
      if (job) {
        job.applicantsCount = (job.applicantsCount || 0) + 1;
        setStored(STORAGE_KEYS.JOBS, list);
      }
    },

    // Colleges
    getColleges() {
      return getStored(STORAGE_KEYS.COLLEGES, defaultColleges);
    },

    addCollege(college) {
      const list = this.getColleges();
      const newCol = {
        id: `COL-${String(list.length + 1).padStart(3, '0')}`,
        status: 'Upcoming',
        registeredCount: 0,
        ...college
      };
      list.push(newCol);
      setStored(STORAGE_KEYS.COLLEGES, list);
      window.dispatchEvent(new CustomEvent('hiresmart:colleges_updated', { detail: list }));
      return newCol;
    },

    // Funnel Metrics
    getFunnelMetrics() {
      return getStored(STORAGE_KEYS.METRICS, defaultMetrics);
    },

    // Audit Logs
    getAuditLogs() {
      return getStored(STORAGE_KEYS.AUDIT_LOGS, defaultAuditLogs);
    },

    // Gemini Question Pool
    getGeminiQuestions(track = 'AI/ML') {
      const pool = geminiQuestionTemplates[track] || geminiQuestionTemplates['AI/ML'];
      // Return 5 questions
      return pool;
    },

    // Reset store to fresh mock defaults
    resetToDefaults() {
      localStorage.removeItem(STORAGE_KEYS.DEMO_SEEDED);
      setStored(STORAGE_KEYS.METRICS, defaultMetrics);
      setStored(STORAGE_KEYS.JOBS, defaultJobs);
      setStored(STORAGE_KEYS.CANDIDATES, defaultCandidates);
      setStored(STORAGE_KEYS.COLLEGES, defaultColleges);
      setStored(STORAGE_KEYS.AUDIT_LOGS, defaultAuditLogs);
      localStorage.setItem(STORAGE_KEYS.DEMO_SEEDED, 'true');
      console.log('[HireSmartStore] State reset to pristine defaults.');
    },

    // Universal toast notification
    showToast(message, type = 'info', duration = 3500) {
      let container = document.getElementById('hiresmart-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'hiresmart-toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = 'ℹ️';
      if (type === 'success') icon = '✓';
      if (type === 'warning') icon = '⚠️';
      if (type === 'danger' || type === 'error') icon = '✕';
      if (type === 'ai') icon = '✨';

      toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('toast-show');
      }, 10);

      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };
})();

// Attach to window for global access
window.HireSmartStore = HireSmartStore;
