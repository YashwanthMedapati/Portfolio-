import { personal, skills, education, certifications, experience } from "@/data/resume";
import { getFact } from "@/data/personalFacts";
import type { Intent } from "@/lib/jrYashBrain";

// The content Jr Yash's fast keyword-matcher answers from. Kept separate
// from the matching/scoring logic in jrYashBrain.ts so that file stays
// "how do we match a query", not "what do we say" - and personal facts are
// pulled from getFact() rather than repeating the text here, so there's one
// place (personalFacts.ts) to update when a fact changes.
export const intents: Intent[] = [
  {
    id: "ml-projects",
    keywords: [
      "ml project",
      "machine learning project",
      "ai project",
      "ai projects",
      "show me yash's ai projects",
      "ml work",
      "projects",
      "portfolio",
    ],
    answer: () => ({
      text: `I would start with NutriDent AI and AI Resume Intelligence. NutriDent AI is my healthcare ML story: real NHANES data, caries-risk prediction, and a React + FastAPI app around it. AI Resume Intelligence is my NLP story: parsing resumes, comparing them to job descriptions, and ranking candidates. The nice thing is that both projects show me building the product around the model, not just stopping at the model.`,
      action: { type: "scroll", target: "projects" },
      followUps: ["Which project best shows my ML skills?", "What tech stack do I use?"],
    }),
  },
  {
    id: "best-ml-project",
    keywords: ["best project", "best shows his ml", "most impressive project", "favorite project", "which project best"],
    answer: () => ({
      text: `If this is for a recruiter, I would lead with NutriDent AI. It is the easiest project to explain quickly: real health data, a trained model, and a usable app around nutrition and dental risk. If the role is more NLP or hiring-tech focused, then AI Resume Intelligence deserves the spotlight because the resume parsing and semantic matching are more relevant.`,
      action: { type: "scroll", target: "projects" },
      followUps: ["Show me my AI projects", "What tech stack do I use?"],
    }),
  },
  {
    id: "tech-stack",
    keywords: ["tech stack", "what technologies", "programming languages", "coding languages", "what do you use", "what does he use", "stack do you use", "stack does he use", "tools do you use", "tools does he use"],
    answer: () => ({
      text: `My day-to-day stack is pretty practical: Python and FastAPI for services, React for interfaces, PostgreSQL for data, and ML tools like scikit-learn or Sentence Transformers when the app needs intelligence. I also work with ${skills.Languages.join(", ")} and tools like ${skills["Databases, Cloud & Tools"].join(", ")}.`,
      action: { type: "scroll", target: "skills" },
      followUps: ["Show me my AI projects", "What's my education background?"],
    }),
  },
  {
    id: "hire-him",
    keywords: ["why should we hire", "why hire him", "why should i hire", "what makes him a good fit", "why yash"],
    answer: () => ({
      text: `I would pitch myself as someone who connects the pieces. A lot of junior portfolios show one layer. My work shows front ends, APIs, databases, data pipelines, and ML all talking to each other. That makes me a better fit for teams that need someone curious, adaptable, and willing to own the messy middle between idea and working product.`,
      action: { type: "scroll", target: "about" },
      followUps: ["Open my resume", "Show me my AI projects"],
    }),
  },
  {
    id: "resume",
    keywords: ["open my resume", "open his resume", "resume", "cv", "download resume", "see my resume", "see his resume"],
    answer: () => ({
      text: `Sure. I will take you to the resume section, where you can preview it or download the PDF.`,
      action: { type: "resume" },
      followUps: ["Why should we hire you?", "What's my education background?"],
    }),
  },
  {
    id: "education",
    keywords: ["education", "school", "university", "degree", "gpa", "background education", "college"],
    answer: () => ({
      text:
        education
          .map((e) => `${e.degree} (${e.track}) from ${e.school}, GPA ${e.gpa}, ${e.dateRange}`)
          .join(". ") + ". Both are from Binghamton University's Watson College of Engineering, so the academic story is very aligned with software, AI, and security.",
      action: { type: "scroll", target: "education" },
      followUps: ["What certifications do I have?", "What tech stack do I use?"],
    }),
  },
  {
    id: "certifications",
    keywords: ["certification", "certificate", "honors", "dean's list", "bootcamp"],
    answer: () => ({
      text: `${certifications.map((c) => `${c.name} (${c.date})`).join("; ")}.`,
      action: { type: "scroll", target: "education" },
      followUps: ["What's my education background?"],
    }),
  },
  {
    id: "experience",
    keywords: ["experience", "work experience", "job history", "internship", "worked as"],
    answer: () => ({
      text: `${experience[0].role} at ${experience[0].org} (${experience[0].dateRange}) gave me hands-on operations experience with real-time availability data across 36 campus parking lots. For engineering depth, I would still point people to my projects, because that is where my full-stack, ML, and data-pipeline work is easiest to evaluate.`,
      action: { type: "scroll", target: "about" },
      followUps: ["Show me my AI projects", "What tech stack do I use?"],
    }),
  },
  {
    id: "target-roles",
    keywords: [
      "what roles",
      "roles is yash applying",
      "jobs is yash applying",
      "actively applying",
      "job search",
      "ml engineer",
      "machine learning engineer role",
      "sde",
      "software development engineer",
      "data analyst",
      "open to work",
    ],
    answer: () => ({
      text: getFact("target-roles"),
      action: { type: "scroll", target: "resume" },
      followUps: ["Do I need sponsorship?", "Why should we hire you?"],
    }),
  },
  {
    id: "sponsorship",
    keywords: [
      "sponsorship",
      "sponsership",
      "visa",
      "green card",
      "greencard",
      "work authorization",
      "authorized to work",
      "need sponsor",
      "future sponsorship",
      "citizenship",
    ],
    answer: () => ({
      text: getFact("sponsorship"),
      action: { type: "scroll", target: "contact" },
      followUps: ["What roles am I applying for?", "Open my resume"],
    }),
  },
  {
    id: "age-height",
    keywords: ["age", "old is yash", "how old", "height", "tall", "5ft", "5 feet"],
    answer: () => ({
      text: getFact("age-height"),
      action: { type: "none" },
      followUps: ["Where did I grow up?", "What languages do I speak?"],
    }),
  },
  {
    id: "origin-move",
    keywords: [
      "where is he from",
      "where did yash grow up",
      "hometown",
      "hyderabad",
      "india",
      "moved to us",
      "moved to the us",
      "when did he move",
      "united states",
    ],
    answer: () => ({
      text: getFact("origin-move"),
      action: { type: "none" },
      followUps: ["What schools did I attend?", "What languages do I speak?"],
    }),
  },
  {
    id: "schools-personal",
    keywords: [
      "schools",
      "schooling",
      "high school",
      "st joseph",
      "malakpet",
      "sri chaithanya",
      "meerpet",
      "john p stevens",
      "jps",
      "edison",
    ],
    answer: () => ({
      text: getFact("schools-personal"),
      action: { type: "scroll", target: "education" },
      followUps: ["What's my education background?", "When did I move to the US?"],
    }),
  },
  {
    id: "languages-personal",
    keywords: ["languages", "speak", "fluent", "english", "hindi", "telugu"],
    answer: () => ({
      text: getFact("languages-personal"),
      action: { type: "none" },
      followUps: ["Where did I grow up?", "What roles am I applying for?"],
    }),
  },
  {
    id: "hobbies-personal",
    keywords: [
      "hobby",
      "hobbies",
      "free time",
      "outside coding",
      "sports",
      "cricket",
      "video games",
      "anime",
      "movies",
      "series",
      "what does yash like",
    ],
    answer: () => ({
      text: getFact("hobbies-personal"),
      action: { type: "none" },
      followUps: ["What are my hidden talents?", "What is my favorite anime?"],
    }),
  },
  {
    id: "talents-dreams",
    keywords: [
      "hidden talent",
      "talents",
      "screenplay",
      "writer",
      "chef",
      "cook",
      "dream",
      "travel",
      "jet",
      "fly",
    ],
    answer: () => ({
      text: getFact("talents-dreams"),
      action: { type: "none" },
      followUps: ["What do I do outside coding?", "What is my favorite color?"],
    }),
  },
  {
    id: "favorites-personal",
    keywords: [
      "favorite color",
      "favourite color",
      "black",
      "favorite anime",
      "favourite anime",
      "favorite movie",
      "favorite music",
      "music taste",
      "favorite song",
    ],
    answer: () => ({
      text: getFact("favorites-personal"),
      action: { type: "scroll", target: "contact" },
      followUps: ["Contact me", "What do I do outside coding?"],
    }),
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "instagram", "reach him", "get in touch", "linkedin", "github profile", "hire him contact"],
    answer: () => ({
      text: `Best place is email: ${personal.email}. You can also call ${personal.phone}, connect with me on LinkedIn at ${personal.linkedinHandle}, message me on Instagram at ${personal.instagramHandle}, or check my code on GitHub at ${personal.githubHandle}.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["Why should we hire you?", "Open my resume"],
    }),
  },
  {
    id: "about-general",
    keywords: ["who is yash", "tell me about yash", "about yash", "who are you modeled after", "who is he"],
    answer: () => ({
      text: personal.summary,
      action: { type: "scroll", target: "about" },
      followUps: ["Show me my AI projects", "Why should we hire you?"],
    }),
  },
  {
    id: "yash-self",
    keywords: ["who are you", "what are you", "are you an ai", "jr yash", "yash bot", "assistant"],
    answer: () => ({
      text: `I'm Yash, the little portfolio guide. I can answer from the resume and project data here, and I can jump you to the right section when it helps. I try to be useful without making things up.`,
      action: { type: "none" },
      followUps: ["Show me my AI projects", "What tech stack do I use?"],
    }),
  },
  {
    id: "personal-question",
    keywords: [
      "hobby",
      "hobbies",
      "free time",
      "personality",
      "music",
      "food",
      "family",
      "where is he from",
      "favorite",
      "what does yash like",
      "personal",
      "outside coding",
      "fun fact",
    ],
    answer: () => ({
      text: `I know a few personal basics now: I grew up in Hyderabad, moved to the US in 2023, speak English, Hindi, and Telugu, like cricket, games, anime, movies, series, and coding, and I am actively applying for ML Engineer, SDE, Software Engineer, and Data Analyst roles. If you want deeper personal details, contact me directly.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["Do I need sponsorship?", "What are my hidden talents?", "Contact me"],
    }),
  },
];
