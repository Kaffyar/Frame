

## Plan: Ultimate Polish Pass — Architecture Portfolio

### Overview
A comprehensive enhancement across every section to make this portfolio a "wow" showcase for clients. Focused on visual refinement, micro-interactions, mobile experience, and professional polish.

### Changes by File

**1. `src/components/HeroSection.tsx` (Navbar + Hero)**
- Add a mobile hamburger menu with a full-screen overlay drawer (animated slide-in, gold accent links)
- Add a subtle floating particle/dot animation in the hero background using GSAP (slow-moving gold dots for atmosphere)
- Add a smooth cursor-follow glow effect on the hero section
- Navbar: add a subtle gold bottom border that appears on scroll
- Hero CTA button: add a gold underline hover animation

**2. `src/components/AboutSection.tsx`**
- Animate the stat numbers counting up from 0 when they scroll into view (GSAP counter)
- Add a subtle gold vertical accent line between the two columns on desktop
- Add a professional headshot placeholder with a gold border frame

**3. `src/components/ServicesSection.tsx`**
- Add a gold icon glow on hover (subtle box-shadow pulse)
- Animate skill bars filling from 0 to their value on scroll (currently static)
- Add a subtle card lift effect (translateY + shadow) on hover

**4. `src/components/ExperienceSection.tsx`**
- Animate the timeline line drawing itself downward as user scrolls (GSAP drawSVG-style using scaleY)
- Timeline dots: add a gold pulse ring animation when each item enters viewport

**5. `src/components/TestimonialsSection.tsx`**
- Add auto-play (cycle every 6s with pause on hover)
- Add a subtle slide-left/slide-right transition direction based on navigation
- Larger, more dramatic quote marks with gold gradient

**6. `src/components/ContactSection.tsx`**
- Add GSAP scroll-triggered entrance animations (stagger form fields)
- Add input focus glow effect (gold border + subtle gold shadow)
- Add a decorative diagonal gold line accent in the background

**7. `src/components/FooterSection.tsx`**
- Expand to include quick nav links, social icons, and a "Back to Top" button
- Add a decorative gold separator line at the top

**8. `src/index.css`**
- Add a custom cursor style (gold dot) for the luxury feel
- Add smooth gold focus ring styles globally
- Add a page loading fade-in animation

**9. `index.html`**
- Add favicon meta (gold-themed)

### Technical Details
- All animations use existing GSAP + ScrollTrigger (no new deps)
- Mobile hamburger uses React state + GSAP for the drawer animation
- Number counter uses `gsap.to` with `snap` on an object's value
- Skill bar animation uses `scrollTrigger` with `onEnter` to trigger width transition
- Custom cursor via CSS `cursor: none` + a positioned div following mouse coordinates
- All changes are purely frontend, no backend needed

