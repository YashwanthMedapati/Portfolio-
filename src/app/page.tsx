import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import { YashFinale } from "@/components/YashFinale";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Education />
        <Resume />
        <Contact />
        <YashFinale />
      </main>
    </>
  );
}
