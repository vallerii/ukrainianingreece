import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Events from "@/components/home/Events";
import News from "@/components/home/News";
import Partners from "@/components/home/Partners";
import JoinCta from "@/components/home/JoinCta";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Events />
      <News />
      <Partners />
      <JoinCta />
    </>
  );
}
