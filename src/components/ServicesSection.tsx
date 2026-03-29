import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Compass, Building2, Map, TreePine, PenTool, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  { icon: Map, title: "Master Planning", description: "Comprehensive district-scale planning that integrates land use, transportation, and community infrastructure." },
  { icon: Building2, title: "Architectural Design", description: "From concept to construction — designing buildings that are functional, sustainable, and iconic." },
  { icon: Compass, title: "Urban Design", description: "Shaping public spaces, streetscapes, and urban frameworks that foster vibrant communities." },
  { icon: TreePine, title: "Landscape Integration", description: "Weaving natural systems into the built environment for resilient and beautiful places." },
  { icon: PenTool, title: "Interior Architecture", description: "Crafting interior spaces that reflect the same rigor and vision as the exterior form." },
  { icon: Layers, title: "Design Consultation", description: "Strategic design advisory for developers, municipalities, and institutions." },
];

const SKILLS = [
  { name: "AutoCAD", level: 95 },
  { name: "Revit BIM", level: 90 },
  { name: "SketchUp", level: 88 },
  { name: "Adobe Creative Suite", level: 85 },
  { name: "Lumion / V-Ray", level: 82 },
  { name: "GIS & Urban Analysis", level: 78 },
  { name: "3ds Max", level: 75 },
  { name: "Rhino / Grasshopper", level: 70 },
];

const ServicesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const skillBarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll("[data-animate]") ?? [];
      elements.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 25 }, {
          opacity: 1, y: 0, duration: 0.6, delay: i * 0.05, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      skillBarRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar,
          { width: "0%" },
          {
            width: `${SKILLS[i].level}%`,
            duration: 1.2,
            ease: "power2.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: bar, start: "top 92%" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative py-32 sm:py-40 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-screen-xl mx-auto">
        <span data-animate className="block font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">
          Services
        </span>
        <h2 data-animate className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-16">
          What I <span className="italic text-gold">bring to the table</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              data-animate
              className="group p-8 border border-border hover:border-gold/30 bg-card hover:bg-surface-hover transition-all duration-500 hover:-translate-y-1"
              style={{ transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.5s, background-color 0.5s, box-shadow 0.5s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px hsl(var(--gold) / 0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div className="relative inline-block mb-6">
                <service.icon className="w-8 h-8 text-gold group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 -m-2 rounded-full bg-gold/0 group-hover:bg-gold/10 transition-all duration-500 blur-md" />
              </div>
              <h3 className="font-display text-xl font-light text-foreground mb-3">
                {service.title}
              </h3>
              <p className="font-body text-xs text-muted-foreground font-light leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <span data-animate className="block font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">
          Technical Skills
        </span>
        <h2 data-animate className="font-display text-3xl sm:text-4xl font-light text-foreground leading-tight mb-12">
          Tools of the <span className="italic text-gold">trade</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          {SKILLS.map((skill, i) => (
            <div key={skill.name} data-animate>
              <div className="flex justify-between mb-2">
                <span className="font-body text-sm text-foreground font-light">{skill.name}</span>
                <span className="font-body text-xs text-muted-foreground">{skill.level}%</span>
              </div>
              <div className="h-[2px] bg-border overflow-hidden">
                <div
                  ref={(el) => { skillBarRefs.current[i] = el; }}
                  className="h-full bg-gold"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
