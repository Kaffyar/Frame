import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  clamp,
  isMobileLikeViewport,
  shouldUseHighQualityDesktopVideo,
  shouldUseLiteMedia,
} from "@/lib/mediaPlayback";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import styles from "./CinematicJourneySection.module.css";

type JourneyPhase = {
  eyebrow: string;
  heading: string;
  body: string;
};

interface CinematicJourneySectionProps {
  posterSrc?: string;
  className?: string;
  scrollDistanceDesktop?: number;
  scrollDistanceMobile?: number;
  sequenceBasePath?: string;
  sequenceFrameCount?: number;
}

const PHASES: JourneyPhase[] = [
  {
    eyebrow: "URBAN CONTEXT",
    heading: "Planning begins at district scale",
    body: "A clear masterplan framework aligns movement, density, and identity before architecture is detailed.",
  },
  {
    eyebrow: "STREET INTERFACE",
    heading: "Quality is tested at arrival level",
    body: "Street edges, active frontages, and human-scaled circulation shape a calm and legible daily experience.",
  },
  {
    eyebrow: "COMMUNITY LIFE",
    heading: "Public realm completes the place",
    body: "Courtyards, shaded pathways, and social spaces bring long-term livability to the planning vision.",
  },
];

const DEFAULT_POSTER_SRC = "/videos/full-journey-scroll-poster.jpg";
const DEFAULT_MOBILE_POSTER_SRC = "/videos/full-journey-scroll-poster-mobile.webp";
const DEFAULT_DESKTOP_VIDEO_LITE_SRC = "/videos/full-journey-sequence-desktop-lite-v2.mp4";
const DEFAULT_DESKTOP_VIDEO_STREAM_SRC = "/videos/full-journey-sequence-desktop-stream-v1.mp4";
const DEFAULT_DESKTOP_VIDEO_HQ_SRC = "/videos/full-journey-sequence-desktop.mp4";
const DEFAULT_SEQUENCE_BASE_PATH = "/videos/full-journey-sequence-60fps-v2";
const DEFAULT_MOBILE_SEQUENCE_BASE_PATH = "/videos/full-journey-sequence-60fps-mobile";
const DEFAULT_SEQUENCE_FRAME_COUNT = 907;
const MOBILE_BREAKPOINT = 767;
const DESKTOP_SCRUB_AMOUNT = 1.02;
const MOBILE_SCRUB_AMOUNT = 1.16;
const DESKTOP_FRAME_LERP = 0.14;
const MOBILE_FRAME_LERP = 0.18;
const DESKTOP_VIDEO_TIME_LERP = 0.24;
const VIDEO_TIME_EPSILON = 1 / 240;
const INITIAL_HIGH_PRIORITY_FRAMES = 14;
const PRIORITY_NEIGHBORHOOD_RADIUS = 12;
const MAX_CONCURRENT_LOADS = 3;
const SEQUENCE_START_ROOT_MARGIN = "140% 0px";
const STAGE_TRIGGER_GROUP = "voyage-stage-flow";

gsap.registerPlugin(ScrollTrigger);

function getFrameSource(basePath: string, index: number): string {
  return `${basePath}/frame-${String(index + 1).padStart(4, "0")}.webp`;
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

export default function CinematicJourneySection({
  posterSrc,
  className,
  scrollDistanceDesktop = 4400,
  scrollDistanceMobile = 3000,
  sequenceBasePath,
  sequenceFrameCount = DEFAULT_SEQUENCE_FRAME_COUNT,
}: CinematicJourneySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRefs = useRef<Array<HTMLDivElement | null>>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const sequenceReadyRef = useRef(false);
  const sequenceStartedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const useLiteMedia = shouldUseLiteMedia(MOBILE_BREAKPOINT);
  const useVideoMedia = !useLiteMedia && !prefersReducedMotion;
  const isLocalPreview =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const useHighQualityDesktopVideo = shouldUseHighQualityDesktopVideo(MOBILE_BREAKPOINT);
  const desktopVideoSrc = useVideoMedia
    ? isLocalPreview
      ? DEFAULT_DESKTOP_VIDEO_HQ_SRC
      : useHighQualityDesktopVideo
        ? DEFAULT_DESKTOP_VIDEO_STREAM_SRC
        : DEFAULT_DESKTOP_VIDEO_LITE_SRC
    : null;
  const resolvedPosterSrc =
    posterSrc ?? (useLiteMedia ? DEFAULT_MOBILE_POSTER_SRC : DEFAULT_POSTER_SRC);
  const resolvedSequenceBasePath =
    sequenceBasePath ??
    (useLiteMedia ? DEFAULT_MOBILE_SEQUENCE_BASE_PATH : DEFAULT_SEQUENCE_BASE_PATH);
  const [isSequenceReady, setIsSequenceReady] = useState(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinRef.current;
    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;
    const phaseEls = phaseRefs.current.filter(Boolean) as HTMLDivElement[];
    const canvasContext =
      canvasEl?.getContext("2d", {
        alpha: false,
        desynchronized: true,
      }) ?? canvasEl?.getContext("2d");

    if (!sectionEl || !pinEl || !canvasEl || !canvasContext || phaseEls.length < 3) {
      return;
    }

    let disposed = false;
    let gsapContext: gsap.Context | null = null;
    let renderRafId: number | null = null;
    let resizeTimeoutId: number | null = null;
    let loadingObserver: IntersectionObserver | null = null;
    let preloadTimeoutId: number | null = null;
    let preloadIdleHandle: number | null = null;
    let preloadStarted = false;
    let interactionListenersAttached = false;
    let activeLoads = 0;
    let frameLerpFactor = DESKTOP_FRAME_LERP;

    if (useVideoMedia) {
      if (!videoEl) {
        return;
      }

      let videoDuration = sequenceFrameCount / 60;
      let lastProgress = 0;
      let targetVideoTime = 0;
      let renderedVideoTime = 0;
      let videoSyncRafId: number | null = null;
      const browserWindow = window as Window &
        typeof globalThis & {
          requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
          cancelIdleCallback?: (handle: number) => void;
        };

      const clearPreloadSchedule = () => {
        if (preloadTimeoutId !== null) {
          window.clearTimeout(preloadTimeoutId);
          preloadTimeoutId = null;
        }

        if (preloadIdleHandle !== null && typeof browserWindow.cancelIdleCallback === "function") {
          browserWindow.cancelIdleCallback(preloadIdleHandle);
          preloadIdleHandle = null;
        }
      };

      const handleInteractionPreload = () => {
        startBackgroundPreload();
      };

      const detachInteractionListeners = () => {
        if (!interactionListenersAttached) {
          return;
        }

        interactionListenersAttached = false;
        window.removeEventListener("wheel", handleInteractionPreload);
        window.removeEventListener("touchstart", handleInteractionPreload);
        window.removeEventListener("pointerdown", handleInteractionPreload);
        window.removeEventListener("keydown", handleInteractionPreload);
      };

      const attachInteractionListeners = () => {
        if (interactionListenersAttached) {
          return;
        }

        interactionListenersAttached = true;
        window.addEventListener("wheel", handleInteractionPreload, { passive: true });
        window.addEventListener("touchstart", handleInteractionPreload, { passive: true });
        window.addEventListener("pointerdown", handleInteractionPreload, { passive: true });
        window.addEventListener("keydown", handleInteractionPreload, { passive: true });
      };

      const stopVideoSyncLoop = () => {
        if (videoSyncRafId !== null) {
          window.cancelAnimationFrame(videoSyncRafId);
          videoSyncRafId = null;
        }
      };

      const setVideoCurrentTime = (time: number, force = false) => {
        if (videoEl.readyState < 1) {
          return;
        }

        if (!force && Math.abs(videoEl.currentTime - time) < VIDEO_TIME_EPSILON) {
          return;
        }

        try {
          videoEl.currentTime = time;
        } catch {
          // Ignore seek errors while metadata is still settling.
        }
      };

      const tickVideoSync = () => {
        videoSyncRafId = window.requestAnimationFrame(() => {
          const delta = targetVideoTime - renderedVideoTime;

          if (Math.abs(delta) <= VIDEO_TIME_EPSILON) {
            renderedVideoTime = targetVideoTime;
          } else {
            renderedVideoTime += delta * DESKTOP_VIDEO_TIME_LERP;
          }

          setVideoCurrentTime(renderedVideoTime);

          if (Math.abs(targetVideoTime - renderedVideoTime) > VIDEO_TIME_EPSILON) {
            tickVideoSync();
            return;
          }

          videoSyncRafId = null;
          renderedVideoTime = targetVideoTime;
          setVideoCurrentTime(renderedVideoTime, true);
        });
      };

      const syncVideoTime = (progress: number, force = false) => {
        const maxTime = Math.max(0, videoDuration - 1 / 60);
        targetVideoTime = clamp(progress * videoDuration, 0, maxTime);

        if (force || !sequenceReadyRef.current) {
          stopVideoSyncLoop();
          renderedVideoTime = targetVideoTime;
          setVideoCurrentTime(renderedVideoTime, true);
          return;
        }

        if (videoSyncRafId === null) {
          tickVideoSync();
        }
      };

      const handleVideoMetadata = () => {
        videoDuration = videoEl.duration || videoDuration;
        renderedVideoTime = clamp(videoEl.currentTime || 0, 0, Math.max(0, videoDuration - 1 / 60));
        syncVideoTime(lastProgress, true);
      };

      const handleVideoReady = () => {
        if (disposed) {
          return;
        }

        sequenceReadyRef.current = true;
        setIsSequenceReady(true);
        syncVideoTime(lastProgress, true);
      };

      const attachVideoSource = () => {
        if (!desktopVideoSrc) {
          return;
        }

        if (videoEl.getAttribute("src") === desktopVideoSrc) {
          return;
        }

        videoEl.src = desktopVideoSrc;
      };

      const startBackgroundPreload = () => {
        if (!desktopVideoSrc || disposed || preloadStarted) {
          return;
        }

        preloadStarted = true;
        clearPreloadSchedule();
        detachInteractionListeners();
        attachVideoSource();
        videoEl.preload = "auto";

        if (videoEl.readyState < 2) {
          videoEl.load();
        }
      };

      const setInitialTextState = () => {
        gsap.set(phaseEls, { autoAlpha: 0, y: 18 });
        gsap.set(phaseEls[0], { autoAlpha: 1, y: 0 });
      };

      const buildTimeline = () => {
        gsapContext?.revert();

        gsapContext = gsap.context(() => {
          if (prefersReducedMotion) {
            gsap.set(phaseEls, { clearProps: "all" });
            return;
          }

          setInitialTextState();

          const scrollDistance = scrollDistanceDesktop;
          const scrubAmount = DESKTOP_SCRUB_AMOUNT;

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: sectionEl,
                start: "top top",
                end: () => `+=${scrollDistance}`,
                pin: pinEl,
                pinSpacing: true,
                pinReparent: true,
                scrub: scrubAmount,
                anticipatePin: 1,
                fastScrollEnd: false,
                preventOverlaps: STAGE_TRIGGER_GROUP,
                refreshPriority: 20,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  lastProgress = self.progress;
                  syncVideoTime(lastProgress);
                },
                onRefresh: (self) => {
                  lastProgress = self.progress;
                  syncVideoTime(lastProgress, true);
                },
              },
            })
            .to(phaseEls[0], { autoAlpha: 0, y: -16, duration: 0.12, ease: "power2.out" }, 0.42)
            .to(phaseEls[1], { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.49)
            .to(phaseEls[1], { autoAlpha: 0, y: -16, duration: 0.12, ease: "power2.out" }, 0.74)
            .to(phaseEls[2], { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.81);
        }, sectionEl);
      };

      const handleResize = () => {
        if (resizeTimeoutId !== null) {
          window.clearTimeout(resizeTimeoutId);
        }

        resizeTimeoutId = window.setTimeout(() => {
          buildTimeline();
          syncVideoTime(lastProgress, true);
        }, 120);
      };

      const startVideoLoadingWhenNearViewport = () => {
        if (prefersReducedMotion) {
          return;
        }

        loadingObserver = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (!entry?.isIntersecting) {
              return;
            }

            startBackgroundPreload();
            loadingObserver?.disconnect();
            loadingObserver = null;
          },
          {
            root: null,
            rootMargin: SEQUENCE_START_ROOT_MARGIN,
            threshold: 0,
          },
        );

        loadingObserver.observe(sectionEl);
      };

      const scheduleBackgroundPreload = () => {
        if (prefersReducedMotion || !desktopVideoSrc) {
          return;
        }

        const beginPreload = () => {
          clearPreloadSchedule();
          startBackgroundPreload();
        };

        attachInteractionListeners();

        if (typeof browserWindow.requestIdleCallback === "function") {
          preloadIdleHandle = browserWindow.requestIdleCallback(() => {
            beginPreload();
          }, { timeout: 600 });
          return;
        }

        preloadTimeoutId = window.setTimeout(() => {
          beginPreload();
        }, 350);
      };

      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.preload = "none";
      videoEl.addEventListener("loadedmetadata", handleVideoMetadata);
      videoEl.addEventListener("loadeddata", handleVideoReady);

      if (videoEl.readyState >= 1) {
        handleVideoMetadata();
      }

      if (videoEl.readyState >= 2) {
        handleVideoReady();
      }

      window.addEventListener("resize", handleResize, { passive: true });
      buildTimeline();
      scheduleBackgroundPreload();
      startVideoLoadingWhenNearViewport();

      return () => {
        disposed = true;
        sequenceReadyRef.current = false;
        setIsSequenceReady(false);

        if (resizeTimeoutId !== null) {
          window.clearTimeout(resizeTimeoutId);
        }

        clearPreloadSchedule();
        detachInteractionListeners();
        stopVideoSyncLoop();
        loadingObserver?.disconnect();
        videoEl.removeEventListener("loadedmetadata", handleVideoMetadata);
        videoEl.removeEventListener("loadeddata", handleVideoReady);
        window.removeEventListener("resize", handleResize);
        gsapContext?.revert();
      };
    }

    const loadedFrames = new Array<boolean>(sequenceFrameCount).fill(false);
    const requestedFrames = new Array<boolean>(sequenceFrameCount).fill(false);
    const images = new Array<HTMLImageElement | null>(sequenceFrameCount).fill(null);
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

      for (let offset = 1; offset < sequenceFrameCount; offset += 1) {
        const previous = targetIndex - offset;
        if (previous >= 0 && loadedFrames[previous]) {
          return images[previous];
        }

        const next = targetIndex + offset;
        if (next < sequenceFrameCount && loadedFrames[next]) {
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
      const frameIndex = clamp(Math.round(targetIndex), 0, sequenceFrameCount - 1);
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
      if (index < 0 || index >= sequenceFrameCount || requestedFrames[index] || loadedFrames[index]) {
        return;
      }

      requestedFrames[index] = true;
      priorityQueue.push(index);
    };

    const queuePriorityNeighborhood = (centerIndex: number) => {
      const clampedCenter = clamp(Math.round(centerIndex), 0, sequenceFrameCount - 1);
      queueFrame(clampedCenter);

      for (let offset = 1; offset <= PRIORITY_NEIGHBORHOOD_RADIUS; offset += 1) {
        queueFrame(clampedCenter + offset);
        queueFrame(clampedCenter - offset);
      }
    };

    const processLoadQueue = () => {
      while (!disposed && activeLoads < MAX_CONCURRENT_LOADS) {
        const frameIndex = consumeQueuedFrame();
        const fetchPriority: "high" | "low" = frameIndex <= 1 ? "high" : "low";

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

        image.src = getFrameSource(resolvedSequenceBasePath, frameIndex);
        images[frameIndex] = image;
      }
    };

    const applyTargetFrame = (force = false) => {
      if (!sequenceStartedRef.current) {
        return;
      }

      queuePriorityNeighborhood(targetFrameRef.current);
      processLoadQueue();

      if (force) {
        if (renderRafId !== null) {
          window.cancelAnimationFrame(renderRafId);
          renderRafId = null;
        }

        renderedFrameRef.current = targetFrameRef.current;
        drawFrameIndex(targetFrameRef.current, true);
        return;
      }

      if (renderRafId === null) {
        tickRenderLoop();
      }
    };

    const setDesiredFrame = (targetFrame: number, force = false) => {
      targetFrameRef.current = clamp(targetFrame, 0, sequenceFrameCount - 1);
      applyTargetFrame(force);
    };

    const startSequenceLoading = () => {
      if (sequenceStartedRef.current || prefersReducedMotion) {
        return;
      }

      sequenceStartedRef.current = true;
      queuePriorityNeighborhood(targetFrameRef.current);

      for (let index = 0; index < INITIAL_HIGH_PRIORITY_FRAMES && index < sequenceFrameCount; index += 1) {
        queueFrame(index);
      }

      processLoadQueue();
      applyTargetFrame(true);
    };

    const setInitialTextState = () => {
      gsap.set(phaseEls, { autoAlpha: 0, y: 18 });
      gsap.set(phaseEls[0], { autoAlpha: 1, y: 0 });
    };

    const buildTimeline = () => {
      gsapContext?.revert();

      gsapContext = gsap.context(() => {
        if (prefersReducedMotion) {
          gsap.set(phaseEls, { clearProps: "all" });
          return;
        }

        setInitialTextState();

        const isMobileLike = isMobileLikeViewport(MOBILE_BREAKPOINT);
        const scrollDistance = isMobileLike ? scrollDistanceMobile : scrollDistanceDesktop;
        const scrubAmount = isMobileLike ? MOBILE_SCRUB_AMOUNT : DESKTOP_SCRUB_AMOUNT;
        frameLerpFactor = isMobileLike ? MOBILE_FRAME_LERP : DESKTOP_FRAME_LERP;

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: sectionEl,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              pin: pinEl,
              pinSpacing: true,
              pinReparent: true,
              scrub: scrubAmount,
              anticipatePin: 1,
              fastScrollEnd: false,
              preventOverlaps: STAGE_TRIGGER_GROUP,
              refreshPriority: 20,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setDesiredFrame(self.progress * (sequenceFrameCount - 1));
              },
              onRefresh: (self) => {
                updateCanvasMetrics(images[currentFrameRef.current]);
                setDesiredFrame(self.progress * (sequenceFrameCount - 1), true);
              },
            },
          })
          .to(phaseEls[0], { autoAlpha: 0, y: -16, duration: 0.12, ease: "power2.out" }, 0.42)
          .to(phaseEls[1], { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.49)
          .to(phaseEls[1], { autoAlpha: 0, y: -16, duration: 0.12, ease: "power2.out" }, 0.74)
          .to(phaseEls[2], { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.81);
      }, sectionEl);
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

    const startLoadingWhenNearViewport = () => {
      if (prefersReducedMotion) {
        return;
      }

      loadingObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (!entry?.isIntersecting) {
            return;
          }

          startSequenceLoading();
          loadingObserver?.disconnect();
          loadingObserver = null;
        },
        {
          root: null,
          rootMargin: SEQUENCE_START_ROOT_MARGIN,
          threshold: 0,
        },
      );

      loadingObserver.observe(sectionEl);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    buildTimeline();
    startLoadingWhenNearViewport();

    return () => {
      disposed = true;
      sequenceReadyRef.current = false;
      sequenceStartedRef.current = false;
      setIsSequenceReady(false);
      lastDrawnFrameRef.current = -1;

      if (renderRafId !== null) {
        window.cancelAnimationFrame(renderRafId);
      }

      if (resizeTimeoutId !== null) {
        window.clearTimeout(resizeTimeoutId);
      }

      loadingObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      gsapContext?.revert();
    };
  }, [
    desktopVideoSrc,
    isLocalPreview,
    prefersReducedMotion,
    resolvedSequenceBasePath,
    scrollDistanceDesktop,
    scrollDistanceMobile,
    sequenceFrameCount,
    useVideoMedia,
  ]);

  return (
    <section
      ref={sectionRef}
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-label="Cinematic architecture and planning journey"
    >
      <div ref={pinRef} className={`${styles.pin} ${prefersReducedMotion ? styles.pinStatic : ""}`}>
        <div className={`${styles.visualStack} ${isSequenceReady ? styles.visualEnhanced : ""}`}>
          <img
            className={styles.posterMedia}
            src={resolvedPosterSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          <video
            ref={videoRef}
            className={`${styles.mediaVideo} ${useVideoMedia && isSequenceReady ? styles.mediaVideoVisible : ""}`}
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          />
          <canvas
            ref={canvasRef}
            className={`${styles.mediaCanvas} ${useVideoMedia ? styles.mediaCanvasHidden : ""}`}
            aria-hidden="true"
          />
        </div>

        <div className={styles.overlay} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />

        <div className={`${styles.contentLayer} ${prefersReducedMotion ? styles.contentLayerStatic : ""}`}>
          <div className={`${styles.contentInner} ${prefersReducedMotion ? styles.contentInnerStatic : ""}`}>
            {PHASES.map((phase, index) => (
              <div
                key={phase.eyebrow}
                ref={(node) => {
                  phaseRefs.current[index] = node;
                }}
                className={`${styles.phase} ${index === 0 ? styles.phaseFirst : ""} ${
                  prefersReducedMotion ? styles.phaseStatic : ""
                }`}
              >
                <p className={styles.eyebrow}>{phase.eyebrow}</p>
                <h3 className={styles.heading}>{phase.heading}</h3>
                <p className={styles.body}>{phase.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
