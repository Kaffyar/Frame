import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Linkedin, Mail, MapPin, Phone, Send, type LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type ContactDetail = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

type SocialLink = {
  icon: LucideIcon;
  label: string;
  href?: string;
};

const CONTACT_DETAILS: ContactDetail[] = [
  { icon: Mail, label: "Email", value: "hello@architect.com", href: "mailto:hello@architect.com" },
  { icon: Phone, label: "Phone", value: "+966 50 000 0000", href: "tel:+966500000000" },
  { icon: MapPin, label: "Location", value: "Riyadh, Saudi Arabia" },
];

// Replace these placeholder profiles with the final public URLs before launch.
const SOCIAL_LINKS: SocialLink[] = [
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
];

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll("[data-anim]") ?? [];
      elements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden bg-background px-6 py-32 sm:px-10 sm:py-40 lg:px-16"
    >
      <div
        className="absolute top-0 right-0 h-[500px] w-px origin-top-right pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--gold)), transparent)",
          transform: "rotate(-35deg)",
          transformOrigin: "top right",
        }}
      />

      <div className="relative mx-auto max-w-screen-lg">
        <span data-anim className="mb-6 block font-body text-xs tracking-[0.3em] uppercase text-gold">
          Contact
        </span>
        <h2
          data-anim
          className="mb-16 font-display text-3xl leading-tight font-light text-foreground sm:text-4xl lg:text-5xl"
        >
          Let&apos;s build <span className="italic text-gold">something together</span>
        </h2>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <p data-anim className="font-body text-sm leading-relaxed font-light text-muted-foreground">
              Whether you have a project in mind, need a design consultation, or want to discuss a
              collaboration - I&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              {CONTACT_DETAILS.map((item) => (
                <div key={item.label} data-anim className="group flex items-start gap-4">
                  <item.icon className="mt-0.5 h-4 w-4 text-gold transition-transform duration-300 group-hover:scale-110" />
                  <div>
                    <span className="mb-1 block font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-body text-sm font-light text-foreground transition-colors duration-300 hover:text-gold"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-body text-sm font-light text-foreground">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div data-anim className="flex gap-4 pt-4">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  aria-label={`${label} profile placeholder`}
                  title={`Add ${label} profile URL`}
                  className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "name", label: "Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "subject", label: "Subject", type: "text" },
            ].map((field) => (
              <div key={field.name} data-anim>
                <label className="mb-2 block font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  required
                  className="w-full border-b border-border bg-transparent pb-3 font-body text-sm font-light text-foreground outline-none transition-all duration-300 focus:border-gold focus:shadow-[0_4px_12px_hsl(var(--gold)/0.08)]"
                />
              </div>
            ))}

            <div data-anim>
              <label className="mb-2 block font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                required
                className="w-full resize-none border-b border-border bg-transparent pb-3 font-body text-sm font-light text-foreground outline-none transition-all duration-300 focus:border-gold focus:shadow-[0_4px_12px_hsl(var(--gold)/0.08)]"
              />
            </div>

            <div data-anim>
              <button
                type="submit"
                className="group inline-flex items-center gap-3 border border-gold px-8 py-4 font-body text-xs tracking-[0.3em] uppercase text-gold transition-all duration-300 hover:bg-gold/10 hover:text-foreground"
              >
                {submitted ? "Sent!" : "Send Message"}
                <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
