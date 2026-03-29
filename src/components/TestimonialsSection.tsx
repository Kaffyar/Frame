import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "An exceptionally talented architect who brings both creative vision and technical mastery to every project. His master plans don't just look beautiful — they work brilliantly.",
    author: "Ahmed Al-Rashid",
    role: "Development Director, Gulf Properties",
  },
  {
    quote: "His understanding of urban context and community needs is unmatched. The waterfront project transformed our city's relationship with the coast entirely.",
    author: "Dr. Sarah Mitchell",
    role: "City Planning Commissioner",
  },
  {
    quote: "Working with him was a masterclass in thoughtful design. Every decision was intentional, every detail considered. The result exceeded all expectations.",
    author: "Omar Hassan",
    role: "CEO, Horizon Developments",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const quoteRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused.current) next();
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  // Slide animation based on direction
  useEffect(() => {
    if (!quoteRef.current) return;
    gsap.fromTo(quoteRef.current,
      { opacity: 0, x: direction * 40 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [current, direction]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 sm:py-40 px-6 sm:px-10 lg:px-16 bg-background border-t border-border"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <div className="max-w-screen-md mx-auto text-center">
        <span className="block font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">
          Testimonials
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-light text-foreground leading-tight mb-16">
          Words from <span className="italic text-gold">clients</span>
        </h2>

        {/* Large decorative quote marks */}
        <div className="mx-auto mb-8 w-16 h-16 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-14 h-14" fill="none">
            <defs>
              <linearGradient id="quoteGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <text x="4" y="34" fontFamily="'Cormorant Garamond', serif" fontSize="48" fontWeight="300" fill="url(#quoteGrad)">"</text>
          </svg>
        </div>

        <div ref={quoteRef} className="min-h-[180px]">
          <p className="font-display text-lg sm:text-xl lg:text-2xl font-light text-foreground leading-relaxed italic mb-8">
            "{TESTIMONIALS[current].quote}"
          </p>
          <span className="block font-body text-sm text-gold mb-1">
            {TESTIMONIALS[current].author}
          </span>
          <span className="block font-body text-xs text-muted-foreground">
            {TESTIMONIALS[current].role}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <button onClick={prev} className="p-2 border border-border hover:border-gold text-muted-foreground hover:text-gold transition-all duration-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`w-8 h-[2px] transition-all duration-300 ${i === current ? "bg-gold scale-y-150" : "bg-border hover:bg-gold/30"}`}
              />
            ))}
          </div>
          <button onClick={next} className="p-2 border border-border hover:border-gold text-muted-foreground hover:text-gold transition-all duration-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
