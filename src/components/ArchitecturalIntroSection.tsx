import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, isMobileLikeViewport } from "@/lib/mediaPlayback";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import styles from "./ArchitecturalIntroSection.module.css";

type Metric = {
  value: string;
  label: string;
};

interface ArchitecturalIntroSectionProps {
  name: string;
  role: string;
  location: string;
  summary: string;
  manifesto: string;
  metrics: Metric[];
}

const LUX_POSTER_SRC = "/videos/luxury-black-house-poster-premium.jpg";
const LUX_SEQUENCE_FRAME_COUNT = 477;
const LUX_SEQUENCE_BASE_PATH = "/videos/luxury-black-house-sequence-60fps-v2";
const MOBILE_BREAKPOINT = 767;
const DESKTOP_SCROLL_DISTANCE = 4000;
const MOBILE_SCROLL_DISTANCE = 2600;
const DESKTOP_SCRUB_AMOUNT = 1.08;
const MOBILE_SCRUB_AMOUNT = 1.24;
const DESKTOP_FRAME_LERP = 0.16;
const MOBILE_FRAME_LERP = 0.22;
const INITIAL_HIGH_PRIORITY_FRAMES = 28;
const PRIORITY_NEIGHBORHOOD_RADIUS = 18;
const MAX_CONCURRENT_LOADS = 4;

gsap.registerPlugin(ScrollTrigger);

function getFrameSource(index: number): string {
  return `${LUX_SEQUENCE_BASE_PATH}/frame-${String(index + 1).padStart(4, "0")}.webp`;
}

function getSourceDimensions(image: CanvasImageSource, fallbackWidth: number, fallbackHeight: number) {
  if (image instanceof HTMLImageElement) {
    return {
      width: image.naturalWidth || fallbackWidth,
      height: image.naturalHeight || fallbackHeight,
    };
  }

  if (image instanceof HTMLCanvasElement || image instanceof ImageBitmap) {
    return {
      width: image.width || fallbackWidth,
      height: image.height || fallbackHeight,
    };
  }

  return {
    width: fallbackWidth,
    height: fallbackHeight,
  };
}

function drawCoverFrame(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
) {
  const { width: sourceWidth, height: sourceHeight } = getSourceDimensions(image, width, height);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  context.clearRect(0, 0, width, height);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export default function ArchitecturalIntroSection({
  name,
  role,
  location,
  summary,
  manifesto,
  metrics,
}: ArchitecturalIntroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const heroViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const luxGlowRef = useRef<HTMLDivElement | null>(null);
  const heroHeadingBlockRef = useRef<HTMLDivElement | null>(null);
  const heroContentGridRef = useRef<HTMLDivElement | null>(null);
  const metricRowRef = useRef<HTMLDivElement | null>(null);
  const scrollPromptRef = useRef<HTMLSpanElement | null>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const sequenceReadyRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isSequenceReady, setIsSequenceReady] = useState(false);
  const manifestoSentence = `${manifesto.split(". ")[0]?.replace(/\.$/, "")}.`;

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const heroViewportEl = heroViewportRef.current;
    const canvasEl = canvasRef.current;
    const luxGlowEl = luxGlowRef.current;
    const heroHeadingBlockEl = heroHeadingBlockRef.current;
    const heroContentGridEl = heroContentGridRef.current;
    const metricRowEl = metricRowRef.current;
    const scrollPromptEl = scrollPromptRef.current;
    const canvasContext =
      canvasEl?.getContext("2d", {
        alpha: false,
        desynchronized: true,
      }) ?? canvasEl?.getContext("2d");

    if (
      !sectionEl ||
      !heroViewportEl ||
      !canvasEl ||
      !canvasContext ||
      !luxGlowEl ||
      !heroHeadingBlockEl ||
      !heroContentGridEl ||
      !metricRowEl ||
      !scrollPromptEl
    ) {
      return;
    }

    let disposed = false;
    let gsapContext: gsap.Context | null = null;
    let renderRafId: number | null = null;
    let resizeTimeoutId: number | null = null;
    let activeLoads = 0;
    let frameLerpFactor = DESKTOP_FRAME_LERP;

    const loadedFrames = new Array<boolean>(LUX_SEQUENCE_FRAME_COUNT).fill(false);
    const requestedFrames = new Array<boolean>(LUX_SEQUENCE_FRAME_COUNT).fill(false);
    const images = new Array<HTMLImageElement | null>(LUX_SEQUENCE_FRAME_COUNT).fill(null);
    const priorityQueue: number[] = [];
    let priorityQueueHead = 0;
    let canvasLayoutWidth = 0;
    let canvasLayoutHeight = 0;
    let canvasTargetWidth = 0;
    let canvasTargetHeight = 0;

    const getBestAvailableFrame = (targetIndex: number): HTMLImageElement | null => {
      if (loadedFrames[targetIndex]) {
        return images[targetIndex];
      }

      for (let offset = 1; offset < LUX_SEQUENCE_FRAME_COUNT; offset += 1) {
        const previous = targetIndex - offset;
        if (previous >= 0 && loadedFrames[previous]) {
          return images[previous];
        }

        const next = targetIndex + offset;
        if (next < LUX_SEQUENCE_FRAME_COUNT && loadedFrames[next]) {
          return images[next];
        }
      }

      return null;
    };

    const consumeQueuedFrame = (): number | undefined => {
      if (priorityQueueHead >= priorityQueue.length) {
        priorityQueue.length = 0;
        priorityQueueHead = 0;
        return undefined;
      }

      const frameIndex = priorityQueue[priorityQueueHead];
      priorityQueueHead += 1;

      if (priorityQueueHead > 64 && priorityQueueHead * 2 > priorityQueue.length) {
        priorityQueue.splice(0, priorityQueueHead);
        priorityQueueHead = 0;
      }

      return frameIndex;
    };

    const updateCanvasMetrics = (frame: CanvasImageSource | null) => {
      const rect = canvasEl.getBoundingClientRect();
      const nextLayoutWidth = Math.max(1, rect.width);
      const nextLayoutHeight = Math.max(1, rect.height);
      const source = frame
        ? getSourceDimensions(frame, nextLayoutWidth, nextLayoutHeight)
        : { width: nextLayoutWidth, height: nextLayoutHeight };
      const sourceDprCap = Math.max(
        1,
        Math.min(source.width / nextLayoutWidth, source.height / nextLayoutHeight),
      );
      const viewportDprCap = isMobileLikeViewport(MOBILE_BREAKPOINT) ? 1.55 : 2;
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, viewportDprCap, sourceDprCap);

      canvasLayoutWidth = nextLayoutWidth;
      canvasLayoutHeight = nextLayoutHeight;
      canvasTargetWidth = Math.max(1, Math.round(nextLayoutWidth * devicePixelRatio));
      canvasTargetHeight = Math.max(1, Math.round(nextLayoutHeight * devicePixelRatio));

      if (canvasEl.width !== canvasTargetWidth || canvasEl.height !== canvasTargetHeight) {
        canvasEl.width = canvasTargetWidth;
        canvasEl.height = canvasTargetHeight;
      }
    };

    const drawFrameIndex = (targetIndex: number, force = false) => {
      const frameIndex = clamp(Math.round(targetIndex), 0, LUX_SEQUENCE_FRAME_COUNT - 1);
      const frame = getBestAvailableFrame(frameIndex);

      currentFrameRef.current = frameIndex;

      if (!frame) {
        return;
      }

      if (force || canvasLayoutWidth === 0 || canvasLayoutHeight === 0 || lastDrawnFrameRef.current === -1) {
        updateCanvasMetrics(frame);
      }

      if (
        !force &&
        lastDrawnFrameRef.current === frameIndex &&
        canvasEl.width === canvasTargetWidth &&
        canvasEl.height === canvasTargetHeight
      ) {
        return;
      }

      if (canvasEl.width !== canvasTargetWidth || canvasEl.height !== canvasTargetHeight) {
        canvasEl.width = canvasTargetWidth;
        canvasEl.height = canvasTargetHeight;
      }

      canvasContext.imageSmoothingEnabled = true;
      canvasContext.imageSmoothingQuality = "high";
      drawCoverFrame(canvasContext, frame, canvasTargetWidth, canvasTargetHeight);
      lastDrawnFrameRef.current = frameIndex;
    };

    const tickRenderLoop = () => {
      renderRafId = window.requestAnimationFrame(() => {
        const delta = targetFrameRef.current - renderedFrameRef.current;

        if (Math.abs(delta) <= 0.08) {
          renderedFrameRef.current = targetFrameRef.current;
        } else {
          renderedFrameRef.current += delta * frameLerpFactor;
        }

        drawFrameIndex(renderedFrameRef.current);

        if (Math.abs(targetFrameRef.current - renderedFrameRef.current) > 0.08) {
          tickRenderLoop();
          return;
        }

        renderRafId = null;
        renderedFrameRef.current = targetFrameRef.current;
        drawFrameIndex(renderedFrameRef.current, true);
      });
    };

    const queueFrame = (index: number) => {
      if (index < 0 || index >= LUX_SEQUENCE_FRAME_COUNT || requestedFrames[index] || loadedFrames[index]) {
        return;
      }

      requestedFrames[index] = true;
      priorityQueue.push(index);
    };

    const queuePriorityNeighborhood = (centerIndex: number) => {
      const clampedCenter = clamp(Math.round(centerIndex), 0, LUX_SEQUENCE_FRAME_COUNT - 1);
      queueFrame(clampedCenter);

      for (let offset = 1; offset <= PRIORITY_NEIGHBORHOOD_RADIUS; offset += 1) {
        queueFrame(clampedCenter + offset);
        queueFrame(clampedCenter - offset);
      }
    };

    const processLoadQueue = () => {
      while (!disposed && activeLoads < MAX_CONCURRENT_LOADS) {
        const frameIndex = consumeQueuedFrame();
        const fetchPriority: "high" | "low" = "high";

        if (frameIndex === undefined) {
          return;
        }

        const image = new Image();
        activeLoads += 1;

        image.decoding = "async";
        if ("fetchPriority" in image) {
          (image as HTMLImageElement & { fetchPriority: "high" | "low" }).fetchPriority = fetchPriority;
        }

        image.onload = () => {
          const finalizeLoad = async () => {
            if (typeof image.decode === "function") {
              try {
                await image.decode();
              } catch {
                // Ignore decode failures and fall back to the loaded frame.
              }
            }

            activeLoads = Math.max(0, activeLoads - 1);

            if (disposed) {
              return;
            }

            loadedFrames[frameIndex] = true;
            images[frameIndex] = image;

            if (!sequenceReadyRef.current && frameIndex === 0) {
              sequenceReadyRef.current = true;
              setIsSequenceReady(true);
            }

            if (frameIndex === 0 || Math.abs(frameIndex - currentFrameRef.current) <= 1) {
              drawFrameIndex(renderedFrameRef.current, true);
            }

            processLoadQueue();
          };

          void finalizeLoad();
        };

        image.onerror = () => {
          activeLoads = Math.max(0, activeLoads - 1);

          if (disposed) {
            return;
          }

          requestedFrames[frameIndex] = false;
          loadedFrames[frameIndex] = false;
          images[frameIndex] = null;
          processLoadQueue();
        };

        image.src = getFrameSource(frameIndex);
        images[frameIndex] = image;
      }
    };

    const scheduleFrame = (targetFrame: number, force = false) => {
      const clampedFrame = clamp(targetFrame, 0, LUX_SEQUENCE_FRAME_COUNT - 1);
      targetFrameRef.current = clampedFrame;
      queuePriorityNeighborhood(clampedFrame);
      processLoadQueue();

      if (force) {
        if (renderRafId !== null) {
          window.cancelAnimationFrame(renderRafId);
          renderRafId = null;
        }

        renderedFrameRef.current = clampedFrame;
        drawFrameIndex(clampedFrame, true);
        return;
      }

      if (renderRafId === null) {
        tickRenderLoop();
      }
    };

    const buildTimeline = () => {
      gsapContext?.revert();

      gsapContext = gsap.context(() => {
        gsap.set(luxGlowEl, { opacity: prefersReducedMotion ? 1 : 0.18 });
        gsap.set(scrollPromptEl, { opacity: prefersReducedMotion ? 0 : 1 });
        gsap.set([heroHeadingBlockEl, heroContentGridEl, metricRowEl], { y: 0, opacity: 1 });

        if (prefersReducedMotion) {
          return;
        }

        const isMobileLike = isMobileLikeViewport(MOBILE_BREAKPOINT);
        const scrollDistance = isMobileLike ? MOBILE_SCROLL_DISTANCE : DESKTOP_SCROLL_DISTANCE;
        const scrubAmount = isMobileLike ? MOBILE_SCRUB_AMOUNT : DESKTOP_SCRUB_AMOUNT;
        frameLerpFactor = isMobileLike ? MOBILE_FRAME_LERP : DESKTOP_FRAME_LERP;

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: sectionEl,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              pin: heroViewportEl,
              pinSpacing: true,
              scrub: scrubAmount,
              anticipatePin: 1,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                scheduleFrame(self.progress * (LUX_SEQUENCE_FRAME_COUNT - 1));
              },
              onRefresh: (self) => {
                updateCanvasMetrics(images[currentFrameRef.current]);
                scheduleFrame(self.progress * (LUX_SEQUENCE_FRAME_COUNT - 1), true);
              },
            },
          })
          .to(scrollPromptEl, { opacity: 0, duration: 0.18 }, 0.05)
          .fromTo(luxGlowEl, { opacity: 0.18 }, { opacity: 0.42, duration: 1 }, 0)
          .fromTo(heroHeadingBlockEl, { y: 0, opacity: 1 }, { y: -8, opacity: 0.98, duration: 1 }, 0)
          .fromTo(heroContentGridEl, { y: 0, opacity: 1 }, { y: -6, opacity: 0.97, duration: 1 }, 0)
          .fromTo(metricRowEl, { y: 0, opacity: 1 }, { y: -3, opacity: 0.99, duration: 1 }, 0);
      }, sectionEl);

      ScrollTrigger.refresh();
    };

    const handleResize = () => {
      if (resizeTimeoutId !== null) {
        window.clearTimeout(resizeTimeoutId);
      }

      resizeTimeoutId = window.setTimeout(() => {
        updateCanvasMetrics(images[currentFrameRef.current]);
        drawFrameIndex(renderedFrameRef.current, true);
        buildTimeline();
      }, 120);
    };

    const primeSequence = () => {
      queuePriorityNeighborhood(0);
      for (let index = 0; index < INITIAL_HIGH_PRIORITY_FRAMES; index += 1) {
        queueFrame(index);
      }

      processLoadQueue();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    buildTimeline();

    if (!prefersReducedMotion) {
      primeSequence();
      scheduleFrame(0, true);
    }

    return () => {
      disposed = true;
      sequenceReadyRef.current = false;
      setIsSequenceReady(false);
      lastDrawnFrameRef.current = -1;

      if (renderRafId !== null) {
        window.cancelAnimationFrame(renderRafId);
      }

      if (resizeTimeoutId !== null) {
        window.clearTimeout(resizeTimeoutId);
      }

      window.removeEventListener("resize", handleResize);
      gsapContext?.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="home"
      aria-label="Architectural portfolio introduction"
    >
      <div ref={heroViewportRef} className={styles.heroViewport}>
        <div className={styles.mediaLayer} aria-hidden="true">
          <img
            className={`${styles.posterMedia} ${isSequenceReady ? styles.posterHidden : ""}`}
            src={LUX_POSTER_SRC}
            alt=""
          />
          <canvas ref={canvasRef} className={styles.mediaCanvas} aria-hidden="true" />
        </div>

        <div className={styles.overlay} aria-hidden="true" />
        <div ref={luxGlowRef} className={styles.luxGlow} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.gridOverlay} aria-hidden="true" />

        <div className={styles.metaLayer} aria-hidden="true">
          <span className={`${styles.metaText} ${styles.metaTopRight}`}>{role} / Portfolio 2026</span>
          <span
            ref={scrollPromptRef}
            className={`${styles.metaText} ${styles.metaBottomCenter} ${prefersReducedMotion ? styles.metaHidden : ""}`}
          >
            Scroll to explore
          </span>
        </div>

        <div className={styles.heroShell}>
          <div ref={heroHeadingBlockRef} className={styles.heroHeadingBlock}>
            <p className={styles.kicker}>{name}</p>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleLine}>Designing Places</span>
              <span className={`${styles.titleLine} ${styles.titleAccent}`}>With Human</span>
              <span className={`${styles.titleLine} ${styles.titleAccent}`}>Clarity</span>
            </h1>
          </div>

          <div ref={heroContentGridRef} className={styles.heroContentGrid}>
            <div className={styles.copyBody}>
              <p>
                {summary} {location}
              </p>
            </div>

            <div className={styles.copyAside}>
              <span className={styles.copyAsideLabel}>Approach</span>
              <p>{manifestoSentence}</p>
            </div>
          </div>

          <div ref={metricRowRef} className={styles.metricRow}>
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.metricCard}>
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
