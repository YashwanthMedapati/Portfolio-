export const personal = {
  name: "Yashwanth Reddy Medapati",
  shortName: "Yash",
  petName: "Yash",
  positioning: "Software Engineer / Machine Learning Engineer",
  tagline:
    "I build full-stack AI systems - from ML models trained on real-world data to the production apps that put them in front of users.",
  location: "New York, USA",
  email: "yashwanthreddy.medapati@gmail.com",
  phone: "+1 908-258-1661",
  github: "https://github.com/YashwanthMedapati",
  githubHandle: "github.com/YashwanthMedapati",
  linkedin: "https://linkedin.com/in/yashwanthmedapati",
  linkedinHandle: "linkedin.com/in/yashwanthmedapati",
  instagram: "https://www.instagram.com/yashwanth_medapati_",
  instagramHandle: "instagram.com/yashwanth_medapati_",
  resumeFile: "/Yashwanth_Reddy_Medapati_Resume.pdf",
  summary:
    "I am a Computer Science graduate with an M.S. and hands-on experience building full-stack applications, machine learning systems, and distributed data pipelines. I work with Python, Java, JavaScript, React, FastAPI, PostgreSQL, and AWS, and I am seeking entry-level Software Engineer or Machine Learning Engineer roles.",
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  type: "Personal Project" | "Group Project";
  dateRange: string;
  github: string;
  /** Optional path under /public to a real screenshot/preview of the project. */
  image?: string;
  /** Optional link to a live, publicly reachable demo. */
  demoUrl?: string;
  /** Optional path under /public to a local demo video. */
  demoVideo?: string;
  stack: string[];
  bullets: string[];
  highlights: { label: string; value: string }[];
  mlFocused: boolean;
  /** Optional deeper narrative for the project's "Case Study" modal. */
  caseStudy?: {
    challenge: string;
    approach: string;
    tradeoffs: string;
    outcome: string;
  };
};

export const projects: Project[] = [
  {
    slug: "nutridentai",
    name: "NutriDent AI",
    tagline: "Caries and Nutrition Tracking Platform",
    type: "Personal Project",
    dateRange: "Jul 2026 - Present",
    github: "https://github.com/YashwanthMedapati/NutridentAI",
    demoVideo: "/demos/nutrident-demo.mp4",
    stack: [
      "React",
      "FastAPI",
      "Python",
      "scikit-learn",
      "PostgreSQL",
      "Google Vision API",
    ],
    bullets: [
      "Built a React + FastAPI platform with 10+ modules for food analysis, wellness tracking, and caries-risk assessment.",
      "Trained a Random Forest model on 6,400+ NHANES records with 20+ dietary and lifestyle features, reaching about 70% accuracy.",
      "Integrated USDA FoodData Central, Open Food Facts, Google Vision API, and barcode workflows for real-time nutrition analysis.",
    ],
    highlights: [
      { label: "Modules", value: "10+" },
      { label: "Training records", value: "6,400+" },
      { label: "Model accuracy", value: "~70%" },
    ],
    mlFocused: true,
    caseStudy: {
      challenge:
        "NHANES is real public-health survey data, not a clean benchmark dataset - it's messy, self-reported, and full of the kind of noise that doesn't show up in a tutorial. The harder problem underneath the model, though, was making a caries-risk score mean something to someone who isn't a dentist: a number alone isn't a product, it needed to be wrapped in food analysis and wellness tracking someone would actually use day to day.",
      approach:
        "I trained a Random Forest on 6,400+ NHANES records across 20+ dietary and lifestyle features, then built the React + FastAPI platform around it as 10+ modules rather than a single script - food analysis, wellness tracking, and the risk assessment itself as separate, composable pieces. Real-time nutrition data comes from USDA FoodData Central and Open Food Facts, with Google Vision API and barcode scanning so a user can log food without typing it in by hand.",
      tradeoffs:
        "A Random Forest over a deeper model was a deliberate choice for a dataset this size - it stays interpretable (which matters for a health-adjacent prediction) and trains fast enough to iterate on feature selection quickly, at the cost of some ceiling accuracy a larger, more complex model might eventually reach with more data.",
      outcome:
        "~70% accuracy is a solid baseline for a first pass on self-reported survey data, and the modular structure means the next real step - more training data, better feature engineering, or a feedback loop from actual usage - slots in without a rewrite.",
    },
  },
  {
    slug: "ai-resume-intelligence",
    name: "AI Resume Intelligence",
    tagline: "Resume Analysis & Candidate Ranking Platform",
    type: "Personal Project",
    dateRange: "Feb 2026 - May 2026",
    github: "https://github.com/YashwanthMedapati/ai-resume-intelligence",
    demoVideo: "/demos/ai-resume-intelligence-demo.mp4",
    stack: [
      "React",
      "FastAPI",
      "Python",
      "Sentence Transformers",
      "NLP",
    ],
    bullets: [
      "Built separate candidate and hiring-team workflows for resume analysis, ATS feedback, and candidate ranking.",
      "Used PDF/DOCX parsing, Sentence Transformers, and cosine similarity to compare resumes with job descriptions.",
      "Validated ranking behavior with 18 predefined test cases and batch support for up to 50 resumes.",
    ],
    highlights: [
      { label: "Batch ranking", value: "50 resumes" },
      { label: "Test cases passed", value: "18/18" },
      { label: "Parsing formats", value: "PDF + DOCX" },
    ],
    mlFocused: true,
    caseStudy: {
      challenge:
        "Keyword-matching ATS tools miss the point: a resume can be a strong fit for a role without sharing exact phrasing with the job description. The other half of the problem was that candidates and hiring teams need genuinely different things from the same underlying analysis - one wants ATS feedback on their own resume, the other wants a ranked shortlist across many candidates.",
      approach:
        "I built separate workflows for each audience on top of the same core: PDF/DOCX parsing feeds Sentence Transformers embeddings, and cosine similarity between a resume's embedding and a job description's embedding drives both the candidate-facing feedback and the hiring-team ranking. I validated the ranking logic against 18 predefined test cases before trusting it on real batches.",
      tradeoffs:
        "Embedding similarity over a fully supervised ranking model was the right call for a personal project without a large labeled dataset of \"good\" resume-to-job matches to train on - it's fast enough for real-time feedback and scales cleanly to batch ranking, though a supervised model trained on real hiring outcomes could eventually capture nuance cosine similarity alone can't.",
      outcome:
        "All 18 predefined test cases pass, and the platform batch-ranks up to 50 resumes in one pass - enough to validate the approach end to end and make the two-workflow split (candidate vs. hiring team) feel like a real product decision, not just a demo script.",
    },
  },
  {
    slug: "toxicity-analytics",
    name: "Multi-Platform Toxicity Analytics",
    tagline: "Distributed Toxicity Analytics Across Reddit & 4chan",
    type: "Group Project",
    dateRange: "Aug 2025 - Dec 2025",
    github: "https://github.com/YashwanthMedapati/Multi-Platform-Toxicity-Analytics-System",
    stack: [
      "Python",
      "PostgreSQL",
      "Reddit OAuth",
      "Google Perspective API",
      "Plotly Dash",
    ],
    bullets: [
      "Engineered a pipeline that processed 2K-9K+ posts per day from Reddit and 4chan into PostgreSQL.",
      "Calculated seven Perspective API toxicity metrics per post and visualized 40+ days of data in Plotly Dash.",
      "Found 3-4x higher mean toxicity on 4chan than Reddit, with spikes exceeding 0.8 during peak events.",
    ],
    highlights: [
      { label: "Posts/day processed", value: "2K-9K+" },
      { label: "Toxicity metrics", value: "7 per post" },
      { label: "Dataset span", value: "40+ days" },
    ],
    mlFocused: false,
  },
];

export type Education = {
  degree: string;
  track: string;
  school: string;
  college: string;
  gpa: string;
  dateRange: string;
};

export const education: Education[] = [
  {
    degree: "Master of Science in Computer Science",
    track: "Cybersecurity Track",
    school: "Binghamton University",
    college: "Thomas J. Watson College of Engineering and Applied Science, NY",
    gpa: "3.5/4.0",
    dateRange: "Aug 2025 - May 2026",
  },
  {
    degree: "Bachelor of Science in Computer Science",
    track: "Artificial Intelligence (AI) Track",
    school: "Binghamton University",
    college: "Thomas J. Watson College of Engineering and Applied Science, NY",
    gpa: "3.4/4.0",
    dateRange: "Aug 2021 - May 2025",
  },
];

export const certifications = [
  { name: "Complete A.I. & Machine Learning, Data Science Bootcamp (ZTM)", date: "Aug 2026" },
  { name: "BCG X Generative AI Virtual Experience Program", date: "May 2026" },
  { name: "Dean's List, Binghamton University", date: "Spring 2024" },
];

export const experience = [
  {
    role: "Student Assistant, Transportation & Parking Services",
    org: "Binghamton University",
    dateRange: "Jan 2025 - May 2026",
    bullets: [
      "Managed real-time availability data and six operational metrics across 36 campus parking lots serving more than 20,800 students and staff.",
      "Validated and published time-sensitive updates through the mCount platform during high-traffic periods.",
      "Analyzed parking-lot utilization patterns to help operations staff improve traffic flow and resource allocation.",
    ],
  },
];

export const skills = {
  Languages: ["Python", "Java", "JavaScript", "SQL", "C++", "C"],
  "Frameworks & Libraries": [
    "React",
    "FastAPI",
    "PyTorch",
    "TensorFlow",
    "scikit-learn",
    "Pandas",
    "NumPy",
    "OpenCV",
  ],
  "Databases, Cloud & Tools": [
    "PostgreSQL",
    "AWS",
    "Git",
    "Plotly Dash",
    "Recharts",
    "Google Vision API",
  ],
  Concepts: [
    "Machine Learning",
    "Deep Learning",
    "Distributed Systems",
    "REST APIs",
    "CI/CD",
  ],
};

export const sectionIds = {
  hero: "hero",
  about: "about",
  projects: "projects",
  skills: "skills",
  education: "education",
  resume: "resume",
  contact: "contact",
} as const;
