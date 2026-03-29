import { Navbar } from "@/components/HeroSection";
import ArchitecturalIntroSection from "@/components/ArchitecturalIntroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ServicesSection from "@/components/ServicesSection";
import ExperienceSection from "@/components/ExperienceSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";

const HERO_METRICS = [
  { value: "50+", label: "Projects completed" },
  { value: "12", label: "Master plans" },
  { value: "8+", label: "Years in practice" },
  { value: "5", label: "Awards and recognitions" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ArchitecturalIntroSection
        name="Architectural Voyage"
        role="Architecture and Urban Planning Portfolio"
        location="Based in Riyadh and working across residential, public-realm, and masterplanning commissions in the GCC."
        summary="Design work that moves from district logic to arrival sequence, frontage character, and the atmosphere of daily life."
        manifesto="Every project should stay coherent at masterplan, street, and residential scale so the larger vision still feels calm when people actually live inside it."
        metrics={HERO_METRICS}
      />

      <AboutSection />
      <ProjectsSection />
      <ServicesSection />
      <ExperienceSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default Index;
