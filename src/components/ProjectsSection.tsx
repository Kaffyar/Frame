import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, MapPin, Maximize2 } from "lucide-react";
import CinematicJourneySection from "@/components/CinematicJourneySection";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  category: string;
  description: string;
  year: string;
  location: string;
  area: string;
  tags: string[];
  accent: string;
  imageSrc: string;
  imageAlt: string;
}

const PROJECTS: Project[] = [
  {
    title: "Al Madinah Cultural Quarter",
    category: "Master Plan",
    description: "A 120-hectare mixed-use development integrating heritage preservation with contemporary urban life.",
    year: "2024",
    location: "Riyadh, KSA",
    area: "120 Ha",
    tags: ["Urban Planning", "Heritage", "Mixed-Use"],
    accent: "from-amber-900/35 via-amber-700/10 to-transparent",
    imageSrc: "/videos/full-journey-scroll-poster-mobile.webp",
    imageAlt: "Aerial view of a district plan with towers, streets, and planted open space.",
  },
  {
    title: "Oasis Residential Tower",
    category: "Residential",
    description: "A 42-storey luxury residential tower with sky gardens and a biophilic design language.",
    year: "2023",
    location: "Jeddah, KSA",
    area: "38,000 sqm",
    tags: ["Residential", "Biophilic", "Luxury"],
    accent: "from-emerald-900/35 via-emerald-700/10 to-transparent",
    imageSrc: "/videos/luxury-black-house-poster-mobile.webp",
    imageAlt: "Contemporary luxury residence framed by landscape and evening light.",
  },
  {
    title: "The Green Corridor",
    category: "Urban Design",
    description: "Transforming a 3.5km arterial road into a pedestrian-first green boulevard with transit integration.",
    year: "2023",
    location: "Dubai, UAE",
    area: "3.5 km",
    tags: ["Urban Design", "Transit", "Landscape"],
    accent: "from-teal-900/35 via-teal-700/10 to-transparent",
    imageSrc: "/videos/full-journey-sequence-60fps-v2/frame-0180.webp",
    imageAlt: "Tree-lined urban corridor with a broad street and pedestrian movement.",
  },
  {
    title: "Heritage Village Masterplan",
    category: "Master Plan",
    description: "Revitalizing a historic district while preserving traditional Najdi architecture and community patterns.",
    year: "2022",
    location: "Diriyah, KSA",
    area: "45 Ha",
    tags: ["Heritage", "Master Plan", "Cultural"],
    accent: "from-orange-900/35 via-orange-700/10 to-transparent",
    imageSrc: "/videos/full-journey-sequence-60fps-v2/frame-0430.webp",
    imageAlt: "Historic urban fabric with layered streets and low-rise architecture.",
  },
  {
    title: "Waterfront Promenade",
    category: "Public Space",
    description: "A 2km coastal promenade featuring adaptive landscape, public art installations, and community zones.",
    year: "2022",
    location: "Dammam, KSA",
    area: "2 km",
    tags: ["Public Space", "Landscape", "Coastal"],
    accent: "from-sky-900/35 via-sky-700/10 to-transparent",
    imageSrc: "/videos/full-journey-sequence-60fps-v2/frame-0670.webp",
    imageAlt: "Public realm scene with planted edges, open circulation, and civic space.",
  },
  {
    title: "Innovation District Hub",
    category: "Mixed-Use",
    description: "A mixed-use innovation campus combining co-working spaces, residential, and retail in a walkable district.",
    year: "2021",
    location: "NEOM, KSA",
    area: "85,000 sqm",
    tags: ["Mixed-Use", "Innovation", "Campus"],
    accent: "from-violet-900/35 via-violet-700/10 to-transparent",
    imageSrc: "/videos/luxury-black-house-sequence-60fps-v2/frame-0320.webp",
    imageAlt: "Contemporary mixed-use building massing with a premium urban atmosphere.",
  },
];

const MARQUEE_TEXT = "ARCHITECTURE   URBAN PLANNING   MASTER PLAN   RESIDENTIAL   PUBLIC SPACE   MIXED-USE   ";

const ProjectsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marquee2Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !cardRef.current) {
      return;
    }

    const totalProjects = PROJECTS.length;

    const ctx = gsap.context(() => {
      let marqueeTween: gsap.core.Tween | null = null;
      let marquee2Tween: gsap.core.Tween | null = null;
      let glowTimeline: gsap.core.Timeline | null = null;

      const label = sectionRef.current?.querySelector("[data-anim-label]");
      if (label) {
        gsap.fromTo(
          label,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: label, start: "top 88%" },
          },
        );
      }

      const heading = sectionRef.current?.querySelector("[data-anim-heading]");
      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, scale: 0.97, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: heading, start: "top 85%" },
          },
        );
      }

      if (marqueeRef.current) {
        marqueeTween = gsap.to(marqueeRef.current, {
          xPercent: -50,
          ease: "none",
          duration: 40,
          repeat: -1,
          paused: true,
        });
      }

      if (marquee2Ref.current) {
        marquee2Tween = gsap.fromTo(
          marquee2Ref.current,
          { xPercent: -50 },
          {
            xPercent: 0,
            ease: "none",
            duration: 40,
            repeat: -1,
            paused: true,
          },
        );
      }

      if (glowRef.current) {
        glowTimeline = gsap
          .timeline({ repeat: -1, yoyo: true, paused: true })
          .to(glowRef.current, { opacity: 0.15, scale: 1.1, duration: 3, ease: "sine.inOut" })
          .to(glowRef.current, { opacity: 0.05, scale: 0.9, duration: 3, ease: "sine.inOut" });
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => {
          const method = isActive ? "play" : "pause";
          marqueeTween?.[method]();
          marquee2Tween?.[method]();
          glowTimeline?.[method]();
        },
      });

      const flipTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current?.querySelector("[data-flip-container]"),
          start: "top 15%",
          end: `+=${totalProjects * 120}%`,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const nextIndex = Math.min(Math.floor(self.progress * totalProjects), totalProjects - 1);
            if (nextIndex !== activeIndexRef.current) {
              activeIndexRef.current = nextIndex;
              setActiveIndex(nextIndex);
            }
          },
        },
      });

      for (let index = 0; index < totalProjects - 1; index += 1) {
        flipTl
          .to(cardRef.current, { duration: 0.3 })
          .to(cardRef.current, {
            rotateX: -75,
            rotateY: 3,
            scale: 0.88,
            y: 30,
            duration: 0.5,
            ease: "power3.in",
          })
          .set(cardRef.current, {
            rotateX: 75,
            rotateY: -3,
            y: -30,
          })
          .to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          });
      }

      flipTl.to(cardRef.current, { duration: 0.3 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const project = PROJECTS[activeIndex];

  return (
    <section id="projects" ref={sectionRef} className="relative overflow-hidden bg-background">
      <div className="px-6 pt-32 sm:px-10 sm:pt-40 lg:px-16">
        <div className="mx-auto max-w-screen-xl">
          <span
            data-anim-label
            className="mb-6 block font-body text-xs uppercase tracking-[0.3em] text-gold opacity-0"
          >
            Selected Work
          </span>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)] lg:items-end">
            <h2
              data-anim-heading
              className="font-display text-3xl font-light leading-tight text-foreground opacity-0 sm:text-4xl lg:text-5xl"
            >
              Projects that <span className="italic text-gold">define places</span>
            </h2>
            <p className="max-w-md font-body text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
              The work opens with a scroll-led study from district structure to street arrival, then narrows into a
              tighter archive of built and masterplanning commissions.
            </p>
          </div>

          <div className="mt-14 sm:mt-16">
            <CinematicJourneySection />
          </div>

          <div className="mt-10 border-t border-border/60 pt-7 sm:mt-12 sm:flex sm:items-end sm:justify-between sm:gap-10 sm:pt-8">
            <div className="max-w-2xl">
              <span className="block font-body text-[10px] uppercase tracking-[0.28em] text-gold/70">
                Project Archive
              </span>
              <p className="mt-4 font-body text-sm font-light leading-relaxed text-muted-foreground">
                A condensed portfolio view with representative images, quick facts, and typologies across residential,
                public-realm, and mixed-use work.
              </p>
            </div>
            <p className="mt-6 max-w-sm font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 sm:mt-0 sm:text-right">
              Six commissions across the GCC, moving from civic scale to residential detail.
            </p>
          </div>
        </div>
      </div>

      <div
        data-flip-container
        className="relative flex min-h-screen items-center justify-center px-6 sm:px-10 lg:px-16"
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px] transition-colors duration-1000"
          style={{ background: "hsl(var(--gold))" }}
        />

        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 select-none overflow-hidden"
          style={{ transform: "translateY(-118%)" }}
        >
          <div ref={marqueeRef} className="whitespace-nowrap">
            <span
              className="font-display font-light leading-none"
              style={{
                fontSize: "clamp(8rem, 14vw, 17rem)",
                letterSpacing: "-0.045em",
                color: "hsl(var(--gold) / 0.05)",
              }}
            >
              {MARQUEE_TEXT.repeat(4)}
            </span>
          </div>
        </div>

        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 select-none overflow-hidden"
          style={{ transform: "translateY(42%)" }}
        >
          <div ref={marquee2Ref} className="whitespace-nowrap">
            <span
              className="font-display font-light leading-none"
              style={{
                fontSize: "clamp(8rem, 14vw, 17rem)",
                letterSpacing: "-0.045em",
                color: "hsl(var(--gold) / 0.05)",
              }}
            >
              {MARQUEE_TEXT.repeat(4)}
            </span>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl" style={{ perspective: "1400px" }}>
          <div
            ref={cardRef}
            className="group relative w-full overflow-hidden border border-border/60 bg-card will-change-transform"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              boxShadow: "0 25px 80px -20px hsl(var(--gold) / 0.12), 0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            <div className="relative h-64 overflow-hidden bg-secondary sm:h-80 lg:h-[420px]">
              <img
                src={project.imageSrc}
                alt={project.imageAlt}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${project.accent}`} />
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-card/20 to-transparent" />

              <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-6">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold/55">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3">
                  <Maximize2 className="h-4 w-4 text-gold/40" />
                  <ArrowUpRight className="h-5 w-5 text-gold/60 transition-colors group-hover:text-gold" />
                </div>
              </div>

              <div className="absolute bottom-6 left-8">
                <span className="inline-block border border-gold/20 bg-gold/10 px-4 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="mb-4 font-display text-2xl font-light leading-tight text-foreground sm:text-3xl lg:text-4xl">
                  {project.title}
                  </h3>
                  <p className="mb-6 max-w-xl font-body text-sm font-light leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-border px-4 py-1.5 font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-300 hover:border-gold/30 hover:text-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 sm:min-w-[140px] sm:flex-col sm:gap-4 sm:text-right">
                  <div>
                    <span className="mb-1 block font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Year
                    </span>
                    <span className="font-display text-xl font-light text-foreground">{project.year}</span>
                  </div>
                  <div>
                    <span className="mb-1 block font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Area
                    </span>
                    <span className="font-display text-xl font-light text-foreground">{project.area}</span>
                  </div>
                  <div>
                    <span className="mb-1 block font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Location
                    </span>
                    <span className="flex items-center gap-1.5 font-body text-xs text-foreground sm:justify-end">
                      <MapPin className="h-3 w-3 text-gold/60" />
                      {project.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>

          <div className="mt-10 flex items-center gap-4">
            <span className="font-body text-[10px] tracking-[0.2em] text-gold/50">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <div className="relative h-[1px] flex-1 bg-border">
              <div
                className="absolute left-0 top-0 h-full bg-gold transition-all duration-500 ease-out"
                style={{ width: `${((activeIndex + 1) / PROJECTS.length) * 100}%` }}
              />
            </div>
            <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">
              {String(PROJECTS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-6 text-center">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
              Scroll to explore
            </span>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </section>
  );
};

export default ProjectsSection;
