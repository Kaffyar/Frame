import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TIMELINE = [
  {
    year: "2024 – Present",
    role: "Senior Architect & Urban Planner",
    company: "Leading Design Studio",
    description: "Leading master planning projects for mega-developments across the Gulf region, focusing on sustainable urbanism and smart city integration.",
  },
  {
    year: "2021 – 2024",
    role: "Project Architect",
    company: "International Architecture Firm",
    description: "Managed end-to-end delivery of mixed-use and residential towers, from concept design through construction administration.",
  },
  {
    year: "2019 – 2021",
    role: "Urban Design Associate",
    company: "Urban Planning Consultancy",
    description: "Developed urban design frameworks, streetscape guidelines, and public realm strategies for municipal clients.",
  },
  {
    year: "2017 – 2019",
    role: "Junior Architect",
    company: "Boutique Architecture Practice",
    description: "Contributed to residential and hospitality projects with a focus on contextual design and material innovation.",
  },
];

const ExperienceSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(lineRef.current, { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current?.querySelector("[data-timeline-container]"),
            start: "top 80%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        });
      }

      const items = sectionRef.current?.querySelectorAll("[data-timeline]") ?? [];
      items.forEach((el) => {
        gsap.fromTo(el, { opacity: 0, x: -20 }, {
          opacity: 1, x: 0, duration: 0.6, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });

        const dot = el.querySelector("[data-dot]");
        if (dot) {
          gsap.fromTo(dot,
            { boxShadow: "0 0 0 0px rgba(190, 160, 100, 0.4)" },
            {
              boxShadow: "0 0 0 8px rgba(190, 160, 100, 0)",
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 85%" },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="relative py-32 sm:py-40 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-screen-lg mx-auto">
        <span className="block font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">
          Experience
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-16">
          A journey through <span className="italic text-gold">design</span>
        </h2>

        <div className="relative" data-timeline-container>
          {/* Timeline line — drawn by GSAP */}
          <div
            ref={lineRef}
            className="absolute left-[7px] top-2 bottom-2 w-px origin-top"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.15))",
              transformOrigin: "top",
              transform: "scaleY(0)",
            }}
          />

          <div className="space-y-12">
            {TIMELINE.map((item) => (
              <div key={item.year} data-timeline className="relative pl-10">
                {/* Dot with pulse ring */}
                <div
                  data-dot
                  className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-gold bg-background"
                />

                <span className="block font-body text-xs tracking-[0.2em] uppercase text-gold mb-2">
                  {item.year}
                </span>
                <h3 className="font-display text-xl font-light text-foreground mb-1">
                  {item.role}
                </h3>
                <span className="block font-body text-sm text-muted-foreground mb-3">
                  {item.company}
                </span>
                <p className="font-body text-xs text-muted-foreground font-light leading-relaxed max-w-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
