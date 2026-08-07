import { personal, projects, skills, education, experience, certifications } from "@/data/resume";
import { personalQuestionnaire } from "@/data/personalQuestions";

export type NavAction =
  | { type: "scroll"; target: string }
  | { type: "resume" }
  | { type: "external"; url: string }
  | { type: "none" };

export type YashAnswer = {
  text: string;
  action: NavAction;
  followUps?: string[];
};

type Intent = {
  id: string;
  keywords: string[];
  answer: () => YashAnswer;
};

const allSkills = Object.values(skills).flat();

function projectList() {
  return projects.map((p) => p.name).join(", ");
}

const intents: Intent[] = [
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
      text: `I would start with NutriDent AI and AI Resume Intelligence. NutriDent AI is the healthcare ML story: real NHANES data, caries-risk prediction, and a React + FastAPI app around it. AI Resume Intelligence is the NLP story: parsing resumes, comparing them to job descriptions, and ranking candidates. The nice thing is that both projects show Yash building the product around the model, not just stopping at the model.`,
      action: { type: "scroll", target: "projects" },
      followUps: ["Which project best shows his ML skills?", "What tech stack does he use?"],
    }),
  },
  {
    id: "best-ml-project",
    keywords: ["best project", "best shows his ml", "most impressive project", "favorite project", "which project best"],
    answer: () => ({
      text: `If this is for a recruiter, I would lead with NutriDent AI. It is the easiest project to explain quickly: real health data, a trained model, and a usable app around nutrition and dental risk. If the role is more NLP or hiring-tech focused, then AI Resume Intelligence deserves the spotlight because the resume parsing and semantic matching are more relevant.`,
      action: { type: "scroll", target: "projects" },
      followUps: ["Show me Yash's AI projects", "What tech stack does he use?"],
    }),
  },
  {
    id: "tech-stack",
    keywords: ["tech stack", "what technologies", "what languages", "what does he use", "stack does he use", "tools does he use"],
    answer: () => ({
      text: `His day-to-day stack is pretty practical: Python and FastAPI for services, React for interfaces, PostgreSQL for data, and ML tools like scikit-learn or Sentence Transformers when the app needs intelligence. He also works with ${skills.Languages.join(", ")} and tools like ${skills["Databases, Cloud & Tools"].join(", ")}.`,
      action: { type: "scroll", target: "skills" },
      followUps: ["Show me Yash's AI projects", "What's his education background?"],
    }),
  },
  {
    id: "hire-him",
    keywords: ["why should we hire", "why hire him", "why should i hire", "what makes him a good fit", "why yash"],
    answer: () => ({
      text: `I would pitch Yash as someone who connects the pieces. A lot of junior portfolios show one layer. His work shows front ends, APIs, databases, data pipelines, and ML all talking to each other. That makes him a better fit for teams that need someone curious, adaptable, and willing to own the messy middle between idea and working product.`,
      action: { type: "scroll", target: "about" },
      followUps: ["Open his resume", "Show me Yash's AI projects"],
    }),
  },
  {
    id: "resume",
    keywords: ["open his resume", "resume", "cv", "download resume", "see his resume"],
    answer: () => ({
      text: `Sure. I will take you to the resume section, where you can preview it or download the PDF.`,
      action: { type: "resume" },
      followUps: ["Why should we hire him?", "What's his education background?"],
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
      followUps: ["What certifications does he have?", "What tech stack does he use?"],
    }),
  },
  {
    id: "certifications",
    keywords: ["certification", "certificate", "honors", "dean's list", "bootcamp"],
    answer: () => ({
      text: `${certifications.map((c) => `${c.name} (${c.date})`).join("; ")}.`,
      action: { type: "scroll", target: "education" },
      followUps: ["What's his education background?"],
    }),
  },
  {
    id: "experience",
    keywords: ["experience", "work experience", "job history", "internship", "worked as"],
    answer: () => ({
      text: `${experience[0].role} at ${experience[0].org} (${experience[0].dateRange}) gave him hands-on operations experience with real-time availability data across 36 campus parking lots. For engineering depth, I would still point people to the projects, because that is where his full-stack, ML, and data-pipeline work is easiest to evaluate.`,
      action: { type: "scroll", target: "about" },
      followUps: ["Show me Yash's AI projects", "What tech stack does he use?"],
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
      text: `Yash is actively applying for entry-level Machine Learning Engineer, Software Development Engineer, Software Engineer, and Data Analyst roles. The strongest fit is work where he can combine Python, full-stack product building, data pipelines, and ML/NLP systems.`,
      action: { type: "scroll", target: "resume" },
      followUps: ["Does Yash need sponsorship?", "Why should we hire him?"],
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
      text: `Yash is a green card holder, so he is authorized to work in the United States and does not need visa sponsorship now or in the future.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["What roles is Yash applying for?", "Open his resume"],
    }),
  },
  {
    id: "age-height",
    keywords: ["age", "old is yash", "how old", "height", "tall", "5ft", "5 feet"],
    answer: () => ({
      text: `Yash is 22 years old and 5 ft 8 in tall.`,
      action: { type: "none" },
      followUps: ["Where did Yash grow up?", "What languages does he speak?"],
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
      text: `Yash grew up in Hyderabad, India, and moved to the United States in 2023. That background shows up in him pretty clearly: adaptable, curious, and comfortable learning fast in new environments.`,
      action: { type: "none" },
      followUps: ["What schools did Yash attend?", "What languages does he speak?"],
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
      text: `Before Binghamton, Yash studied at St. Joseph's in Malakpet, Hyderabad, Sri Chaitanya in Meerpet, and John P. Stevens High School in Edison, New Jersey. His college education is both B.S. and M.S. Computer Science at Binghamton University's Watson College of Engineering.`,
      action: { type: "scroll", target: "education" },
      followUps: ["What's his education background?", "When did he move to the US?"],
    }),
  },
  {
    id: "languages-personal",
    keywords: ["languages", "speak", "fluent", "english", "hindi", "telugu"],
    answer: () => ({
      text: `Yash speaks English, Hindi, and Telugu fluently.`,
      action: { type: "none" },
      followUps: ["Where did Yash grow up?", "What roles is Yash applying for?"],
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
      text: `Outside coding, Yash likes playing sports, especially cricket, playing video games, watching anime, movies, and series, and yes, still coding for fun when an idea gets stuck in his head.`,
      action: { type: "none" },
      followUps: ["What are Yash's hidden talents?", "What is his favorite anime?"],
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
      text: `Two fun facts: Yash writes screenplays and is a genuinely good chef. A bigger dream of his is to travel the world and fly in a jet someday.`,
      action: { type: "none" },
      followUps: ["What does Yash do outside coding?", "What is Yash's favorite color?"],
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
      text: `Yash's favorite color is black. For anime, movies, and music, the list is too big for me to answer cleanly here, so it is better to contact him directly if you want the full conversation.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["Contact Yash", "What does Yash do outside coding?"],
    }),
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "instagram", "reach him", "get in touch", "linkedin", "github profile", "hire him contact"],
    answer: () => ({
      text: `Best place is email: ${personal.email}. You can also call ${personal.phone}, connect on LinkedIn at ${personal.linkedinHandle}, message him on Instagram at ${personal.instagramHandle}, or check the code on GitHub at ${personal.githubHandle}.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["Why should we hire him?", "Open his resume"],
    }),
  },
  {
    id: "about-general",
    keywords: ["who is yash", "tell me about yash", "about yash", "who are you modeled after", "who is he"],
    answer: () => ({
      text: personal.summary,
      action: { type: "scroll", target: "about" },
      followUps: ["Show me Yash's AI projects", "Why should we hire him?"],
    }),
  },
  {
    id: "yash-self",
    keywords: ["who are you", "what are you", "are you an ai", "jr yash", "yash bot", "assistant"],
    answer: () => ({
      text: `I'm Yash, the little portfolio guide. I can answer from the resume and project data here, and I can jump you to the right section when it helps. I try to be useful without making things up.`,
      action: { type: "none" },
      followUps: ["Show me Yash's AI projects", "What tech stack does he use?"],
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
      text: `I know a few personal basics now: Yash grew up in Hyderabad, moved to the US in 2023, speaks English, Hindi, and Telugu, likes cricket, games, anime, movies, series, and coding, and is actively applying for ML Engineer, SDE, Software Engineer, and Data Analyst roles. If you want deeper personal details, contact him directly.`,
      action: { type: "scroll", target: "contact" },
      followUps: ["Does Yash need sponsorship?", "What are Yash's hidden talents?", "Contact Yash"],
    }),
  },
];

const fallback: YashAnswer = {
  text: `I do not know that from the portfolio data yet. I can answer best about Yash's projects, skills, education, resume, and contact info. I will take you to the contact section so you can ask him directly.`,
  action: { type: "scroll", target: "contact" },
  followUps: ["Contact Yash", "Show me Yash's AI projects", "What tech stack does he use?"],
};

function score(query: string, keywords: string[]): number {
  const q = query.toLowerCase();
  let best = 0;
  for (const kw of keywords) {
    if (q.includes(kw)) {
      best = Math.max(best, kw.length);
    } else {
      const words = kw.split(" ");
      const hits = words.filter((w) => w.length > 2 && q.includes(w)).length;
      if (hits > 0) best = Math.max(best, hits * 2);
    }
  }
  return best;
}

export function askJrYash(query: string): YashAnswer {
  if (!query.trim()) return fallback;
  let bestIntent: Intent | null = null;
  let bestScore = 0;
  for (const intent of intents) {
    const s = score(query, intent.keywords);
    if (s > bestScore) {
      bestScore = s;
      bestIntent = intent;
    }
  }
  if (bestIntent && bestScore >= 3) {
    return bestIntent.answer();
  }
  return fallback;
}

export const suggestedPrompts = [
  "follow me",
  "break",
  "priya",
  "Show me Yash's AI projects",
  "Does Yash need sponsorship?",
  "What roles is Yash applying for?",
  "Where did Yash grow up?",
  "What tech stack does he use?",
  "Why should we hire him?",
  "Open his resume",
  "Which project best shows his ML skills?",
];

export const greeting: YashAnswer = {
  text: `Hey, I'm Yash. Ask me about projects, skills, education, the resume, or why he is a fit. You can also try "follow me" if you want the little Yash to trail your cursor.`,
  action: { type: "none" },
  followUps: suggestedPrompts,
};

export { allSkills, personalQuestionnaire, projectList };
