import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Events from "@/components/home/Events";
import News from "@/components/home/News";
import Partners from "@/components/home/Partners";
import JoinCta from "@/components/home/JoinCta";
import { getLatestArticles, getRecentPastEvents, getUpcomingEvents } from "@/lib/cms";

export const revalidate = 60;

export default async function Home() {
  const [articles, upcoming, recent] = await Promise.all([
    getLatestArticles(3),
    getUpcomingEvents(1, null, 4),
    getRecentPastEvents(2),
  ]);

  return (
    <>
      <Hero />
      <About />
      {/* Партнери та підтримка — за правкою клієнта перед «Прийдешніми подіями» */}
      <Partners />
      <Events upcoming={upcoming.items} recent={recent} />
      <News articles={articles} />
      {/* Проєкти-сателіти — за правкою клієнта нижче новин */}
      <Projects />
      <JoinCta />
    </>
  );
}
