export type PersonalFact = { id: string; question: string; answer: string };

// The single source of truth for Yash's personal-fact answers. Both the
// fast keyword-matched intents (jrYashIntents.ts, via getFact()) and the AI
// system prompt (yashSystemPrompt.ts) read from here, so there is exactly
// one place to update a fact instead of two or three copies drifting apart.
export const personalFacts: PersonalFact[] = [
  {
    id: "age-height",
    question: "How old am I and how tall am I?",
    answer: "I am 22 years old and 5 ft 8 in tall.",
  },
  {
    id: "origin-move",
    question: "Where did I grow up and when did I move to the US?",
    answer:
      "I grew up in Hyderabad, India, and moved to the United States in 2023. That background shows up in me pretty clearly: adaptable, curious, and comfortable learning fast in new environments.",
  },
  {
    id: "schools-personal",
    question: "What schools did I attend?",
    answer:
      "Before Binghamton, I studied at St. Joseph's in Malakpet, Hyderabad, Sri Chaitanya in Meerpet, and John P. Stevens High School in Edison, New Jersey. My college education is both B.S. and M.S. Computer Science at Binghamton University's Watson College of Engineering.",
  },
  {
    id: "languages-personal",
    question: "What languages do I speak?",
    answer: "I speak English, Hindi, and Telugu fluently.",
  },
  {
    id: "sponsorship",
    question: "Do I need visa sponsorship?",
    answer:
      "I am a green card holder, so I am authorized to work in the United States and do not need visa sponsorship now or in the future.",
  },
  {
    id: "target-roles",
    question: "What roles am I applying for?",
    answer:
      "I am actively applying for entry-level Machine Learning Engineer, Software Development Engineer, Software Engineer, and Data Analyst roles. The strongest fit is work where I can combine Python, full-stack product building, data pipelines, and ML/NLP systems.",
  },
  {
    id: "hobbies-personal",
    question: "What do I do outside coding?",
    answer:
      "Outside coding, I like playing sports, especially cricket, playing video games, watching anime, movies, and series, and yes, still coding for fun when an idea gets stuck in my head.",
  },
  {
    id: "talents-dreams",
    question: "What are my hidden talents and dreams?",
    answer:
      "Two fun facts: I write screenplays and I am a genuinely good chef. A bigger dream of mine is to travel the world and fly in a jet someday.",
  },
  {
    id: "favorites-personal",
    question: "What is my favorite color, anime, movies, or music?",
    answer:
      "My favorite color is black. For anime, movies, and music, the list is too big for me to answer cleanly here, so it is better to contact me directly if you want the full conversation.",
  },
  {
    id: "availability",
    question: "When am I available to start work?",
    answer:
      "I'm free to start immediately - I'm not tied to a start date and can begin as soon as the right role comes together.",
  },
  {
    id: "work-arrangement",
    question: "What's my preference on remote, hybrid, or onsite work, and am I open to relocating?",
    answer:
      "I'm flexible on work arrangement - remote, hybrid, or onsite all work for me - and I'm open to relocating for the right opportunity.",
  },
  {
    id: "career-goals",
    question: "Where do I see myself in a few years, or what are my career goals?",
    answer:
      "In a few years, I want to be in a role where I've grown real ownership - leading meaningful projects, mentoring other engineers, and building a stable, well-compensated career that reflects the effort I put in every day.",
  },
  {
    id: "strengths-weaknesses",
    question: "What are my strengths and weaknesses?",
    answer:
      "My biggest strength is how fast I adapt - I've switched schools, moved across cultures, and worked with all kinds of people, so I pick up new environments and technologies quickly. That same trait is also my weakness: I'm a perfectionist. I don't stop until something feels right, which pushes quality up but can also mean I spend longer than I should polishing my own or someone else's work before I'm satisfied.",
  },
  {
    id: "biggest-challenge",
    question: "What's my biggest challenge or proudest achievement?",
    answer:
      "I'm proudest of shipping full-stack ML systems end to end, like NutriDent AI and AI Resume Intelligence - training a real model and wrapping it in a production-ready app instead of leaving it in a notebook. The biggest challenge along the way has been making the ML and product sides work well together, which taught me to evaluate a model by how useful it is to a real user, not just its accuracy on paper.",
  },
  {
    id: "current-status",
    question: "What's my current status - am I still in school or have I graduated?",
    answer:
      "I graduated with my M.S. in Computer Science from Binghamton University in May 2026, and I'm now actively looking for full-time Software Engineer or Machine Learning Engineer roles.",
  },
];

const factsById = new Map(personalFacts.map((fact) => [fact.id, fact.answer]));

// Throws on a typo'd id rather than silently rendering "undefined" in an
// answer - any caller mistyping an id fails at first render, not in prod.
export function getFact(id: string): string {
  const answer = factsById.get(id);
  if (!answer) throw new Error(`Unknown personal fact id: "${id}"`);
  return answer;
}
