import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = ["About", "Projects", "Services", "Experience", "Contact"];

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;

      if (window.scrollY > 100) {
        navRef.current.classList.add("backdrop-blur-md", "bg-background/80", "border-b", "border-gold/10");
        navRef.current.classList.remove("bg-transparent");
      } else {
        navRef.current.classList.remove(
          "backdrop-blur-md",
          "bg-background/80",
          "border-b",
          "border-gold/10",
        );
        navRef.current.classList.add("bg-transparent");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, pointerEvents: "none" },
        { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" },
      );
      const links = overlayRef.current.querySelectorAll("[data-nav-link]");
      gsap.fromTo(
        links,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.15 },
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 right-0 left-0 z-50 bg-transparent transition-all duration-500"
      >
        <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between px-6 sm:px-10 lg:px-16">
          <button
            onClick={() => scrollTo("home")}
            className="font-display text-xl font-light tracking-wide text-foreground"
          >
            Architectural Voyage
          </button>

          <div className="hidden items-center gap-10 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="relative font-body text-xs tracking-[0.2em] uppercase text-muted-foreground transition-colors duration-300 hover:text-gold after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-gold after:content-[''] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            className="p-2 text-foreground transition-colors hover:text-gold md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center opacity-0 pointer-events-none md:hidden"
        style={{ background: "hsl(var(--background) / 0.97)" }}
      >
        <button
          className="absolute top-6 right-6 p-2 text-foreground transition-colors hover:text-gold"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-7 w-7" />
        </button>

        <div className="flex flex-col items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              data-nav-link
              onClick={() => scrollTo(item.toLowerCase())}
              className="font-display text-3xl font-light tracking-wider text-foreground transition-colors duration-300 hover:text-gold"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export { Navbar };
