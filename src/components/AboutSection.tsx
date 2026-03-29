import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 50, suffix: "+", label: "Projects Completed" },
  { value: 12, suffix: "", label: "Master Plans" },
  { value: 8, suffix: "+", label: "Years Experience" },
  { value: 5, suffix: "", label: "Awards" },
];

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll("[data-animate]") ?? [];
      elements.forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        });
      });

      statRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = { val: 0 };
        gsap.to(target, {
          val: STATS[i].value,
          duration: 2,
          ease: "power2.out",
          snap: { val: 1 },
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = Math.round(target.val) + STATS[i].suffix;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-32 sm:py-40 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-screen-lg mx-auto">
        <span data-animate className="block font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">
          About
        </span>
        <h2 data-animate className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-12">
          Where architecture meets<br /><span className="italic text-gold">urban vision</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 relative">
          {/* Gold vertical accent line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{
            background: "linear-gradient(to bottom, transparent, hsl(var(--gold) / 0.3), transparent)"
          }} />

          <div data-animate>
            {/* Headshot placeholder */}
            <div className="w-28 h-28 mb-8 relative">
              <div className="w-full h-full bg-secondary flex items-center justify-center border-2 border-gold/30" style={{
                boxShadow: "0 0 30px hsl(var(--gold) / 0.1)"
              }}>
                <span className="font-display text-3xl text-gold/40">A</span>
              </div>
              <div className="absolute -inset-1 border border-gold/10 pointer-events-none" />
            </div>

            <p className="font-body text-sm sm:text-base font-light text-muted-foreground leading-relaxed mb-6">
              With a deep foundation in Architecture and Urban Planning, I approach every
              project as an opportunity to shape how people experience their environment.
              From initial concept through final execution, my work bridges aesthetic 
              ambition with functional precision.
            </p>
            <p className="font-body text-sm sm:text-base font-light text-muted-foreground leading-relaxed">
              My design philosophy centers on human-scale urbanism — creating spaces that 
              feel both grand in vision and intimate in experience. Every master plan, 
              every building, every detail serves the people who will inhabit it.
            </p>
          </div>

          <div data-animate className="space-y-8">
            {[
              { label: "Education", value: "B.Arch in Architecture & Urban Planning" },
              { label: "Focus", value: "Master Planning, Residential & Mixed-Use Design" },
              { label: "Philosophy", value: "Human-centered design at every scale" },
              { label: "Approach", value: "Research-driven, context-sensitive, future-ready" },
            ].map((item) => (
              <div key={item.label} className="border-l border-gold/30 pl-6 hover:border-gold transition-colors duration-300">
                <span className="block font-body text-xs tracking-[0.2em] uppercase text-gold mb-1">
                  {item.label}
                </span>
                <span className="font-body text-sm text-foreground font-light">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div data-animate className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-border pt-12">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <span
                ref={(el) => { statRefs.current[i] = el; }}
                className="block font-display text-3xl sm:text-4xl font-light text-gold mb-2"
              >
                0
              </span>
              <span className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
