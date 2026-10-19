import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Events from "@/components/home/Events";
import News from "@/components/home/News";
// import Partners from "@/components/home/Partners";
import JoinCta from "@/components/home/JoinCta";
import { getLatestArticles, getRecentPastEvents, getUpcomingEvents } from "@/lib/cms";
import { getOrganizations, toNetwork, toProjectCards } from "@/lib/organizations";
import { buildStats } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const [articles, upcoming, recent, orgs] = await Promise.all([
    getLatestArticles(3),
    getUpcomingEvents(1, null, 8),
    getRecentPastEvents(8),
    getOrganizations(),
  ]);
  const network = toNetwork(orgs);
  const foundersCount = network.filter((o) => o.role === "Засновник").length;

  return (
    <>
      <Hero />
      <About founders={network} stats={buildStats(foundersCount)} />
      <Events upcoming={upcoming.items} recent={recent} />
      <News articles={articles} />
      {/* Постійні проєкти — за правкою клієнта нижче новин */}
      <Projects projects={toProjectCards(orgs)} />
      <JoinCta />
      {/* Партнери та підтримка — правка 18.10.2026: у самий низ сторінки (рішення про блок ще не остаточне) */}
      {/* Партнери та підтримка — приховано за рішенням 20.10.2026; щоб повернути, розкоментуйте */}
      {/* <Partners /> */}
    </>
  );
}
