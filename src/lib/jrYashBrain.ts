import { skills } from "@/data/resume";
import { getFact } from "@/data/personalFacts";
import { intents as intentData } from "@/data/jrYashIntents";

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

export type Intent = {
  id: string;
  keywords: string[];
  answer: () => YashAnswer;
};

const intents = intentData;

const skillLookup = new Map(
  Object.values(skills).flat().map((skill) => [skill.toLowerCase(), skill])
);

export const fallback: YashAnswer = {
  text: `I do not know that from the portfolio data yet. I can answer best about my projects, skills, education, resume, and contact info. I will take you to the contact section so you can ask me directly.`,
  action: { type: "scroll", target: "contact" },
  followUps: ["Contact me", "Show me your AI projects", "What tech stack do you use?"],
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

function spokenLanguageAnswer(query: string): YashAnswer | null {
  const q = query.toLowerCase();
  const asksSpokenLanguage =
    (q.includes("language") || q.includes("speak") || q.includes("fluent")) &&
    (q.includes("speak") || q.includes("spoken") || q.includes("fluent") || q.includes("english") || q.includes("hindi") || q.includes("telugu"));

  if (!asksSpokenLanguage) return null;
  return {
    text: getFact("languages-personal"),
    action: { type: "none" },
    followUps: ["Where did you grow up?", "What programming languages do you use?"],
  };
}

function individualSkillAnswer(query: string): YashAnswer | null {
  const q = query.toLowerCase();
  const isSkillQuestion =
    /\b(do you know|does he know|know|use|work with|good at|experience with|skilled in)\b/.test(q) ||
    q.includes("can you use");
  if (!isSkillQuestion) return null;

  for (const [normalized, displayName] of skillLookup) {
    const pattern = new RegExp(`(^|\\W)${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i");
    if (!pattern.test(query)) continue;
    return {
      text: `Yes. I work with ${displayName}. In this portfolio, ${displayName} fits into my broader stack across ${skills.Languages.join(", ")}, plus frameworks, ML libraries, databases, cloud, and tools like ${skills["Frameworks & Libraries"].slice(0, 5).join(", ")} and ${skills["Databases, Cloud & Tools"].slice(0, 4).join(", ")}.`,
      action: { type: "scroll", target: "skills" },
      followUps: ["What tech stack do you use?", "Show me your AI projects"],
    };
  }

  return null;
}

export function matchIntent(query: string): YashAnswer | null {
  if (!query.trim()) return null;
  const spoken = spokenLanguageAnswer(query);
  if (spoken) return spoken;
  const skill = individualSkillAnswer(query);
  if (skill) return skill;

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
  return null;
}

export function askJrYash(query: string): YashAnswer {
  return matchIntent(query) ?? fallback;
}

export const suggestedPrompts = [
  "follow me",
  "break",
  "Show me your AI projects",
  "Do you need sponsorship?",
  "What roles are you applying for?",
  "Where did you grow up?",
  "What tech stack do you use?",
  "Why should we hire you?",
  "Open your resume",
  "Which project best shows your ML skills?",
];

export const greeting: YashAnswer = {
  text: `Hey, I'm Yash. Ask me about my projects, skills, education, resume, or why I am a fit. You can also try "follow me" if you want the little Yash to trail your cursor.`,
  action: { type: "none" },
  followUps: suggestedPrompts,
};
