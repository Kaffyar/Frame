import { ArrowUp, Instagram, Linkedin, Mail, type LucideIcon } from "lucide-react";

type SocialLink = {
  icon: LucideIcon;
  label: string;
  href?: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Mail, label: "Email", href: "mailto:hello@architect.com" },
];

const FooterSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-background px-6 py-16 sm:px-10 lg:px-16">
      <div
        className="absolute top-0 left-1/2 h-px w-[60%] -translate-x-1/2"
        style={{
          background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.4), transparent)",
        }}
      />

      <div className="mx-auto max-w-screen-lg">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <span className="mb-2 block font-display text-xl font-light text-foreground">
              Architectural Voyage
            </span>
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              Architecture & Urban Planning - shaping the future of cities through thoughtful
              design.
            </p>
          </div>

          <div>
            <span className="mb-4 block font-body text-xs tracking-[0.2em] uppercase text-gold">
              Navigation
            </span>
            <div className="flex flex-col gap-2">
              {["About", "Projects", "Services", "Experience", "Contact"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-left font-body text-xs text-muted-foreground transition-colors duration-300 hover:text-gold"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 sm:items-end">
            <div>
              <span className="mb-4 block font-body text-xs tracking-[0.2em] uppercase text-gold sm:text-right">
                Connect
              </span>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-all duration-300 hover:border-gold hover:text-gold"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span
                      key={label}
                      aria-label={`${label} profile placeholder`}
                      title={`Add ${label} profile URL`}
                      className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-all duration-300"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  ),
                )}
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground transition-colors duration-300 hover:text-gold"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-body text-[10px] tracking-wider text-muted-foreground">
            Copyright {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="font-body text-[10px] tracking-wider text-muted-foreground/40">
            Designed with precision
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
