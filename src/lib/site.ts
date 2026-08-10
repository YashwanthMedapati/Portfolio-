import { personal, projects } from "@/data/resume";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://yashwanthmedapati.com";

export const siteTitle = "Yashwanth Medapati";

export const siteDescription =
  "Yashwanth Medapati's software engineering and machine learning portfolio, featuring full-stack AI projects, data pipelines, resume analysis tooling, and NutriDent AI.";

export const siteKeywords = [
  "Yashwanth Medapati",
  "Yashwanth Reddy Medapati",
  "Software Engineer",
  "Machine Learning Engineer",
  "Full-Stack Developer",
  "Data Analyst",
  "React",
  "FastAPI",
  "Python",
  "Portfolio",
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function getStructuredData() {
  const profileUrl = absoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${profileUrl}#person`,
        name: personal.name,
        alternateName: siteTitle,
        url: profileUrl,
        image: absoluteUrl("/profile/yash-profile.jpeg"),
        jobTitle: personal.positioning,
        email: `mailto:${personal.email}`,
        address: {
          "@type": "PostalAddress",
          addressCountry: "US",
        },
        sameAs: [personal.github, personal.linkedin, personal.instagram],
        knowsAbout: [
          "Software engineering",
          "Machine learning",
          "Full-stack development",
          "Data analysis",
          "Distributed systems",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${profileUrl}#website`,
        url: profileUrl,
        name: siteTitle,
        description: siteDescription,
        publisher: {
          "@id": `${profileUrl}#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${profileUrl}#projects`,
        name: "Featured portfolio projects",
        itemListElement: projects.map((project, index) => ({
          "@type": "CreativeWork",
          position: index + 1,
          name: project.name,
          description: project.tagline,
          url: project.github,
          creator: {
            "@id": `${profileUrl}#person`,
          },
          keywords: project.stack.join(", "),
        })),
      },
    ],
  };
}
