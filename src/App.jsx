import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const chapters = [
  {
    step: "01",
    name: "Build",
    title: "Build a plan you trust.",
    copy: "Choose your split. Shape the week before your first set.",
    screenImage: "/media/shft-ios-plan-builder.png",
    screenAlt: "Shft Plan Builder screen with a Monday Chest workout",
  },
  {
    step: "02",
    name: "Learn",
    title: "Know every lift.",
    copy: "Illustrated technique, the muscles it hits, and cues you can use mid-set.",
    screenImage: "/media/shft-ios-exercise-detail.png",
    screenAlt: "Shft exercise detail screen for the barbell bench press",
  },
  {
    step: "03",
    name: "Lift",
    title: "Stay with the work.",
    copy: "Log sets, reps, and rest without leaving the floor.",
    screenImage: "/media/shft-ios-active-session.png",
    screenAlt: "Shft active workout screen",
  },
  {
    step: "04",
    name: "Review",
    title: "See every set count.",
    copy: "Each session ends with your top sets, first-time lifts, and total volume.",
    screenImage: "/media/shft-ios-session-summary.png",
    screenAlt: "Shft session summary screen",
  },
  {
    step: "05",
    name: "Recover",
    title: "Train what is ready.",
    copy: "Estimates from your logged sessions show which muscles are fresh and which need time.",
    screenImage: "/media/shft-ios-recovery.png",
    screenAlt: "Shft recovery screen with a muscle fatigue map",
  },
  {
    step: "06",
    name: "Progress",
    title: "See what to do next.",
    copy: "When you hit the top of your range, Shft gives you the next cue.",
    screenImage: "/media/shft-ios-progress.png",
    screenAlt: "Shft progress screen",
  },
];

const buildGridMedia = [
  { type: "video", src: "/media/build-reset.mp4" },
  { type: "video", src: "/media/build-redplates.mp4" },
  { type: "image", src: "/media/build-pulldown.jpeg" },
  { type: "video", src: "/media/build-squat.mp4" },
  { type: "image", src: "/media/build-barbell.jpeg" },
  { type: "image", src: "/media/ambient-lifter.jpeg" },
];

const communityParticles = Array.from({ length: 56 }, (_, index) => ({
  x: `${(index * 29 + 7) % 96 + 2}%`,
  y: `${(index * 37 + 11) % 94 + 3}%`,
  size: `${index % 7 === 0 ? 6 : index % 3 === 0 ? 3.5 : 2}px`,
  trail: `${24 + index % 5 * 9}px`,
  delay: `${-(index % 11) * 0.78}s`,
  duration: `${11 + (index % 8) * 1.35}s`,
}));

const communityRails = [
  { side: "left-outer", media: [
    "/media/community-flow-01-compact.mp4", "/media/community-flow-02-compact.mp4", "/media/community-flow-03-compact.mp4", "/media/community-flow-04-compact.mp4", "/media/community-flow-05-compact.mp4", "/media/community-more-09.mp4",
  ] },
  { side: "left-inner", media: [
    "/media/community-flow-06-compact.mp4", "/media/community-flow-07-compact.mp4", "/media/community-flow-08-compact.mp4", "/media/community-flow-09-compact.mp4", "/media/community-flow-10-compact.mp4",
  ] },
  { side: "right-inner", media: [
    "/media/community-flow-11-compact.mp4", "/media/community-flow-12-compact.mp4", "/media/community-more-01-compact.mp4", "/media/community-more-02-compact.mp4", "/media/community-more-03-compact.mp4",
  ] },
  { side: "right-outer", media: [
    "/media/community-more-04-compact.mp4", "/media/community-more-05-compact.mp4", "/media/community-more-06-compact.mp4", "/media/community-more-07-compact.mp4", "/media/community-more-08-compact.mp4", "/media/community-more-10.mp4",
  ] },
];

// Pinned system timeline rhythm, shared by the scroll story and the resume anchor.
const CHAPTER_START = .72;
const CHAPTER_STEP = 1.18;
const chapterProgress = (index) => {
  const total = CHAPTER_START + (chapters.length - 2) * CHAPTER_STEP + 1.35;
  const enter = index === 0 ? 0 : CHAPTER_START + (index - 1) * CHAPTER_STEP + .98;
  const exit = index === chapters.length - 1 ? total : CHAPTER_START + index * CHAPTER_STEP + .14;
  return (enter + exit) / 2 / total;
};

function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" /></svg>;
}

function HeroMotion({ reduced }) {
  const video = useRef(null);

  useEffect(() => {
    const element = video.current;
    if (!element || reduced) return undefined;
    let inView = false;
    const syncPlayback = () => {
      if (inView && !document.hidden) element.play().catch(() => {});
      else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.12 });
    observer.observe(element);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      element.pause();
    };
  }, [reduced]);

  return <div className="hero-motion" aria-hidden="true"><video ref={video} autoPlay={!reduced} muted loop playsInline preload="auto" fetchPriority="high" poster="/media/hero-motion-poster.jpg"><source src="/media/hero-motion-mobile-pingpong.mp4" media="(max-width: 820px)" type="video/mp4" /><source src="/media/hero-motion-desktop-pingpong.mp4" type="video/mp4" /></video></div>;
}

function BuildMediaGrid({ reduced }) {
  if (reduced) return null;
  // Media budget: phones render fewer tiles, videos poster-first.
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const tiles = isTouch ? buildGridMedia.slice(0, 4) : buildGridMedia;
  return <div className="build-media-grid" aria-hidden="true">
    {tiles.map((asset) => <div className="build-media-tile" key={asset.src}>
      {asset.type === "video"
        ? <video muted loop playsInline preload="none" poster={asset.src.replace(".mp4", ".jpg")}><source src={asset.src} type="video/mp4" /></video>
        : <img src={asset.src} alt="" loading="lazy" decoding="async" />}
    </div>)}
  </div>;
}

function CommunityParticles() {
  return <div className="community-particles" aria-hidden="true">
    {communityParticles.map((particle, index) => <i key={index} style={{
      "--particle-x": particle.x,
      "--particle-y": particle.y,
      "--particle-size": particle.size,
      "--particle-trail": particle.trail,
      "--particle-delay": particle.delay,
      "--particle-duration": particle.duration,
    }} />)}
  </div>;
}

function CommunityClip({ src, active }) {
  return <div className="community-stream-tile">
    <video muted loop playsInline preload="none" poster={src.replace(/(?:-compact)?\.mp4$/, ".jpg")}>
      {active && <source src={src} type="video/mp4" />}
    </video>
  </div>;
}

function CommunityWall({ reduced }) {
  const wall = useRef(null);
  const [near, setNear] = useState(false);
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const scene = wall.current?.closest(".community-scene");
    if (!scene || reduced) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "90% 0px" });
    observer.observe(scene);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    const element = wall.current;
    if (!element || !near || reduced) return undefined;
    const scene = element.closest(".community-scene");
    const tiles = [...element.querySelectorAll(".community-stream-tile")];
    let frame = 0;
    let inView = false;
    let lastSync = 0;

    const pauseAll = () => tiles.forEach((tile) => tile.querySelector("video")?.pause());
    const syncPlayback = () => {
      frame = 0;
      if (document.hidden) { pauseAll(); return; }
      tiles.forEach((tile) => {
        const player = tile.querySelector("video");
        const rect = tile.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
        // Play every materially visible tile, including the top and bottom rows.
        // Completely clipped tiles retain their poster and no decoder work.
        const visible = visibleHeight >= Math.min(32, rect.height * .08) && visibleWidth >= Math.min(24, rect.width * .08);
        if (visible) {
          if (player.paused) player.play().catch(() => {});
        } else if (!player.paused) player.pause();
      });
    };
    const schedulePlayback = () => {
      if (!frame) frame = window.requestAnimationFrame(syncPlayback);
    };
    const onVisibilityChange = () => {
      if (document.hidden) pauseAll();
      else schedulePlayback();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedulePlayback();
      else pauseAll();
    });
    observer.observe(scene);
    // Scrubbed tracks keep moving after the last native scroll event. Check at
    // 10Hz while this scene is visible so edge rows never retain stale playback.
    const onTrackTick = (time) => {
      if (inView && !document.hidden && time - lastSync >= .1) {
        lastSync = time;
        schedulePlayback();
      }
    };
    gsap.ticker.add(onTrackTick);
    window.addEventListener("scroll", schedulePlayback, { passive: true });
    window.addEventListener("resize", schedulePlayback, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    schedulePlayback();
    return () => {
      observer.disconnect();
      gsap.ticker.remove(onTrackTick);
      window.removeEventListener("scroll", schedulePlayback);
      window.removeEventListener("resize", schedulePlayback);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (frame) window.cancelAnimationFrame(frame);
      pauseAll();
    };
  }, [near, reduced]);

  const rails = isTouch ? communityRails.filter(({ side }) => side === "left-inner" || side === "right-inner") : communityRails;
  return <div className="community-streams" ref={wall} aria-hidden="true">
    {rails.map(({ side, media }) => <div className={`community-stream community-stream-${side}`} key={side}>
      <div className="community-stream-track">
        <div className="community-media-group">
          {media.map((src) => <CommunityClip src={src} active={near && !reduced} key={src} />)}
        </div>
      </div>
    </div>)}
  </div>;
}

function App() {
  const internalArrival = Boolean(document.referrer && new URL(document.referrer).origin === window.location.origin);
  const [loaded, setLoaded] = useState(internalArrival);
  const [reducedPreference, setReducedPreference] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const reduced = reducedPreference;
  const root = useRef(null);
  const readingAnchor = useRef(null);
  const cinematicAnchor = useRef(null);

  const rememberReadingPosition = () => {
    const sections = [...root.current.querySelectorAll("section, .site-footer")];
    const section = sections.find((element) => {
      const bounds = (element.parentElement.classList.contains("pin-spacer") ? element.parentElement : element).getBoundingClientRect();
      return bounds.top <= window.innerHeight / 2 && bounds.bottom > window.innerHeight / 2;
    }) || sections[sections.length - 1];
    const extent = section.parentElement.classList.contains("pin-spacer") ? section.parentElement : section;
    const bounds = extent.getBoundingClientRect();
    const chapters = [...section.querySelectorAll(".chapter")];
    const isStatic = root.current.classList.contains("is-motion-off");
    const chapter = isStatic
      ? chapters.findIndex((element) => element.getBoundingClientRect().bottom > 110)
      : chapters.reduce((best, element, index) => Number(getComputedStyle(element).opacity) > Number(getComputedStyle(chapters[best]).opacity) ? index : best, 0);
    const progress = isStatic && cinematicAnchor.current?.section === section
      ? cinematicAnchor.current.progress
      : Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - window.innerHeight)));
    readingAnchor.current = { section, chapter, progress, atEnd: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4 };
    if (!isStatic) cinematicAnchor.current = readingAnchor.current;
  };

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = (event) => {
      rememberReadingPosition();
      setReducedPreference(event.matches);
    };
    preference.addEventListener("change", onPreferenceChange);
    return () => preference.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setLoaded(true), reduced ? 80 : 1050);
    // One fixed bar for the whole page: the moment the page leaves the hero's
    // first frame it floats on a frosted-glass backing. Content never re-lays out.
    const chrome = document.querySelector(".site-nav");
    const onChromeScroll = () => chrome.classList.toggle("is-docked", window.scrollY > 24);
    onChromeScroll();
    window.addEventListener("scroll", onChromeScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onChromeScroll); };
  }, []);

  useEffect(() => {
    if (!loaded) return undefined;
    if (reduced) return undefined;

    const contextCleanupsGlobal = [];
    const contextCleanups = [];
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      lerp: .12, smoothWheel: true, wheelMultiplier: .95, anchors: false,
      virtualScroll: (input) => {
        if (input.event.ctrlKey) return;
        if (settling) { lenis.scrollTo(lenis.actualScroll, { immediate: true }); settling = false; settleCooldown = 0; }
        if (input.event.type !== "wheel" || performance.now() < settleCooldown || Math.abs(input.deltaY) > 120 || !input.deltaY) return;
        const y = lenis.targetScroll;
        const predicted = y + input.deltaY;
        for (const section of settleSections) {
          const top = sectionTop(section);
          if ((top - y) * input.deltaY > 0 && Math.abs(predicted - top) <= 56) {
            // Correct this input's destination within Lenis itself. The next
            // wheel event is free to continue through the edge immediately.
            input.deltaY = top - y;
            break;
          }
        }
      },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(500, 33);

    // Anchors and on-input magnets share one scroll engine. Pinned sections use
    // their spacer's document position, not offsetTop relative to that spacer.
    const settleSections = [...root.current.querySelectorAll("section")];
    const sectionTop = (section) => {
      const anchor = section.parentElement.classList.contains("pin-spacer") ? section.parentElement : section;
      return Math.max(0, Math.min(window.scrollY + anchor.getBoundingClientRect().top, document.documentElement.scrollHeight - window.innerHeight));
    };
    let settleCooldown = 0;
    let settling = false;
    const glideTo = (targetY, duration = 1.15) => {
      settling = true;
      settleCooldown = performance.now() + duration * 1000 + 700;
      lenis.scrollTo(targetY, {
        duration, easing: (t) => 1 - Math.pow(1 - t, 4),
        onComplete: () => { settling = false; },
      });
    };
    const onAnchorClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let target;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      if (location.hash !== url.hash) history.pushState(null, "", url.hash);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      glideTo(sectionTop(target), 1.35);
    };
    const onScrollInput = (event) => {
      if (event.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
      if (settling) { lenis.scrollTo(lenis.actualScroll, { immediate: true }); settling = false; settleCooldown = 0; }
    };
    const onHistoryNavigation = () => {
      if (settling) { lenis.scrollTo(lenis.actualScroll, { immediate: true }); settling = false; }
      settleCooldown = performance.now() + 1800;
    };
    document.addEventListener("click", onAnchorClick);
    window.addEventListener("popstate", onHistoryNavigation);
    const inputEvents = ["touchstart", "keydown"];
    inputEvents.forEach((type) => window.addEventListener(type, onScrollInput, { passive: true }));
    contextCleanupsGlobal.push(() => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("popstate", onHistoryNavigation);
      inputEvents.forEach((type) => window.removeEventListener(type, onScrollInput));
    });

    const ambientVideos = root.current ? [...root.current.querySelectorAll(".manifesto-video")] : [];
    const visibleAmbientVideos = new Set();
    const syncAmbientPlayback = () => ambientVideos.forEach((video) => {
      if (visibleAmbientVideos.has(video) && !document.hidden) video.play().catch(() => {});
      else video.pause();
    });
    const ambientVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visibleAmbientVideos.add(entry.target) : visibleAmbientVideos.delete(entry.target));
      syncAmbientPlayback();
    }, { threshold: 0.08, rootMargin: "18% 0px" });
    ambientVideos.forEach((video) => ambientVideoObserver.observe(video));
    document.addEventListener("visibilitychange", syncAmbientPlayback);
    const finalPhone = root.current.querySelector(".final-phone-pixel");
    let phoneVisible = false;
    const syncPhoneMotion = () => { finalPhone.style.animationPlayState = phoneVisible && !document.hidden ? "running" : "paused"; };
    const phoneObserver = new IntersectionObserver(([entry]) => { phoneVisible = entry.isIntersecting; syncPhoneMotion(); });
    phoneObserver.observe(finalPhone);
    syncPhoneMotion();
    document.addEventListener("visibilitychange", syncPhoneMotion);
    contextCleanupsGlobal.push(() => { phoneObserver.disconnect(); document.removeEventListener("visibilitychange", syncPhoneMotion); finalPhone.style.animationPlayState = ""; });

    // Early-start: the manifesto video begins decoding+playing on the FIRST scroll
    // away from the hero, so it's already in motion when the section arrives.
    const manifestoVideo = document.querySelector(".manifesto-video");
    let earlyStartFired = false;
    const onFirstScrollEarlyStart = () => {
      if (earlyStartFired || window.scrollY < 40) return;
      earlyStartFired = true;
      window.removeEventListener("scroll", onFirstScrollEarlyStart);
      if (manifestoVideo && manifestoVideo.paused) {
        manifestoVideo.preload = "auto";
        manifestoVideo.play().catch(() => {});
      }
    };
    if (manifestoVideo) window.addEventListener("scroll", onFirstScrollEarlyStart, { passive: true });
    contextCleanupsGlobal.push(() => window.removeEventListener("scroll", onFirstScrollEarlyStart));

    const context = gsap.context(() => {
      const splitHeadingLines = (element) => SplitText.create(element, { type: "lines", linesClass: "split-line" });

      const intro = gsap.timeline({ paused: true, delay: 0.32, defaults: { ease: "power4.out" } });
      intro
        // clearProps hands the nav's transform back to CSS for the docked states.
        .from(".site-nav", { y: -24, autoAlpha: 0, duration: 0.8, clearProps: "transform,translate" })
        .from(".hero-eyebrow", { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.4")
        .from(".hero-title .line", { yPercent: 62, clipPath: "inset(0 0 100% 0)", duration: 1.05, stagger: 0.09 }, "-=0.42")
        .from(".hero-copy", { y: 26, autoAlpha: 0, duration: 0.85 }, "-=0.62")
        .from(".hero-actions", { y: 18, autoAlpha: 0, duration: 0.75 }, "-=0.6")
        // Reveal masks are transitional — release them so the title's glow can breathe free.
        .set(".hero-title .line", { clipPath: "none" });
      if (internalArrival) intro.progress(1);
      else intro.play();

      // Top bar docking is scrubbed, not toggled: glass and lift track the first
      // 180px of scroll with a short inertial lag, identical in both directions.
      gsap.fromTo(".site-nav", { "--dock": 0 }, {
        "--dock": 1, ease: "power1.inOut",
        scrollTrigger: { start: 0, end: 180, scrub: .5 },
      });

      // Reading progress: a hairline that fills with the page.
      gsap.fromTo(".scroll-progress", { scaleX: 0 }, {
        scaleX: 1, ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: .25 },
      });

      // The nav marks the section being read.
      gsap.utils.toArray(".nav-links a").forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (!section) return;
        ScrollTrigger.create({
          trigger: section, start: "top 55%", end: "bottom 55%",
          onToggle: (self) => self.isActive ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current"),
        });
      });

      gsap.to(".hero-title", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
      });

      // Opacity only (not autoAlpha): hidden links stay reachable by keyboard, and
      // clamp() lets content at the very bottom of the page still reveal.
      gsap.utils.toArray("[data-reveal]").forEach((element) => {
        const reveal = gsap.fromTo(element, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: .8, ease: "power3.out", paused: true,
        });
        element.addEventListener("focusin", () => reveal.play());
        ScrollTrigger.create({
          trigger: element, endTrigger: element.closest("section, footer"), start: "clamp(top 92%)", end: "bottom top",
          onToggle: (self) => self.isActive ? reveal.play() : reveal.reverse(),
          onRefresh: (self) => reveal.progress(self.isActive ? 1 : 0),
        });
      });

      // Masked line reveals on every section heading that isn't already covered
      gsap.utils.toArray(".manifesto h2, .pricing-section h2, .final-cta h2").forEach((heading) => {
        const split = splitHeadingLines(heading);
        gsap.fromTo(split.lines, { yPercent: 58, clipPath: "inset(-8% 0 100% 0)" } , {
          yPercent: 0,
          clipPath: "inset(-8% 0 -14% 0)",
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: heading, endTrigger: heading.closest("section"), start: "top 85%", end: "bottom top", toggleActions: "play reverse play reverse" },
        });
      });

      const traceSteps = gsap.utils.toArray(".trace-step");
      const traceConnectors = gsap.utils.toArray(".manifesto-trace i");
      const setActiveTraceStep = (activeIndex) => traceSteps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));
      gsap.set(traceSteps[0], { "--trace-fill": "100%" });
      setActiveTraceStep(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => setActiveTraceStep(self.progress < .32 ? 0 : self.progress < .64 ? 1 : 2),
          onLeave: () => {
            gsap.set(traceSteps[2], { "--trace-fill": "100%" });
            setActiveTraceStep(2);
          },
        },
      })
        .to(traceConnectors[0], { scaleX: 1, autoAlpha: 1, duration: .2, ease: "none" }, .1)
        .to(traceSteps[0], { "--trace-fill": "0%", duration: .14, ease: "none" }, .3)
        .to(traceSteps[1], { "--trace-fill": "100%", duration: .18, ease: "none" }, .34)
        .to(traceConnectors[1], { scaleX: 1, autoAlpha: 1, duration: .2, ease: "none" }, .48)
        .to(traceSteps[1], { "--trace-fill": "0%", duration: .14, ease: "none" }, .6)
        .to(traceSteps[2], { "--trace-fill": "100%", duration: .18, ease: "none" }, .66)
        .to(traceSteps[2], { "--trace-fill": "100%", duration: .16, ease: "none" }, .84);

      const panels = gsap.utils.toArray(".chapter");
      const phoneScreens = gsap.utils.toArray(".phone-screen");
      const buildVideos = gsap.utils.toArray(".build-media-grid video");

      // Scroll arrest: the pinned system section eases out over its final 8% instead of hard-releasing.
      // Pin budget scales with the chapter count; phones hold for less distance per chapter.
      const SYSTEM_HOLD_END = `+=${chapters.length * (isTouch ? 52 : 80)}%`;
      let buildMediaPlaying = false;
      const setBuildMediaPlayback = (shouldPlay) => {
        if (shouldPlay === buildMediaPlaying) return;
        buildMediaPlaying = shouldPlay;
        buildVideos.forEach((video) => shouldPlay ? video.play().catch(() => {}) : video.pause());
      };
      const systemStory = gsap.timeline({
        scrollTrigger: {
          trigger: ".training-system", start: "top top", end: SYSTEM_HOLD_END, pin: true,
          scrub: 0.9, anticipatePin: 1,
          onUpdate: (self) => setBuildMediaPlayback(self.progress < 0.9),
          onLeave: () => setBuildMediaPlayback(false),
          onLeaveBack: () => setBuildMediaPlayback(false),
        },
      })
        .to(".build-media-grid", { autoAlpha: 0.42, yPercent: -6, duration: 0.8 }, 0.68);
      // Stack Push per chapter: the current iOS screen shifts left and dims while the
      // next enters from the right — it reads as navigation, not a crossfade. Chapter
      // copy hands off sequentially so two titles never overlap mid-scroll.
      for (let index = 1; index < panels.length; index++) {
        const at = CHAPTER_START + (index - 1) * CHAPTER_STEP;
        systemStory
          .to(panels[index - 1], { autoAlpha: 0, y: -20, duration: .34 }, at + .14)
          .set(phoneScreens[index], { zIndex: index + 1 }, at)
          .to(phoneScreens[index - 1], { xPercent: -24, scale: 1, autoAlpha: .86, duration: 1, ease: "power2.inOut" }, at)
          .fromTo(phoneScreens[index], { xPercent: 100, autoAlpha: 1, scale: 1 }, { xPercent: 0, scale: 1, duration: 1, ease: "power2.inOut" }, at)
          .fromTo(panels[index], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .48 }, at + .5);
        if (index > 1) systemStory.to(phoneScreens[index - 2], { autoAlpha: 0, duration: .01 }, at + 1);
      }
      const releaseAt = CHAPTER_START + (panels.length - 2) * CHAPTER_STEP + 1.05;
      // Soft release: the last beat drifts the whole stack up gently — no jolt on unpin.
      systemStory
        .to(".chapter-stack", { y: -34, ease: "power1.in", duration: .3 }, releaseAt)
        .to(".phone-mockup", { y: -26, ease: "power1.in", duration: .3 }, releaseAt);

      // ─── Alive layer: ambient drift, cursor depth, magnetic CTAs ──────────
      if (!reduced) {
        // Ambient drift: glows breathe on slow sine loops — the page is never frozen.
        const breathers = gsap.utils.toArray(".final-glow, .hero-aura").filter((el) => el);
        breathers.forEach((glow, i) => {
          gsap.to(glow, {
            scale: 1.07 + i * 0.02,
            opacity: "+=0.035",
            duration: 9 + i * 2.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        });

        // Cursor depth: pointer biases the system-section glow (desktop only, spring-damped).
        if (window.matchMedia("(pointer: fine)").matches) {
          const glowX = gsap.quickTo(".system-glow", "x", { duration: 1.1, ease: "power3.out" });
          const glowY = gsap.quickTo(".system-glow", "y", { duration: 1.1, ease: "power3.out" });
          const onPointer = (event) => {
            const nx = event.clientX / window.innerWidth - 0.5;
            const ny = event.clientY / window.innerHeight - 0.5;
            glowX(nx * 46);
            glowY(ny * 34);
          };
          window.addEventListener("pointermove", onPointer, { passive: true });
          contextCleanups.push(() => window.removeEventListener("pointermove", onPointer));

          // Magnetic CTAs: ≤6px pull toward the cursor.
          gsap.utils.toArray(".button-primary, .nav-cta").forEach((cta) => {
            const ctaX = gsap.quickTo(cta, "x", { duration: 0.45, ease: "power3.out" });
            const ctaY = gsap.quickTo(cta, "y", { duration: 0.45, ease: "power3.out" });
            const onEnter = () => gsap.to(cta, { scale: 1.02, duration: 0.35, ease: "power3.out" });
            const onLeave = () => { gsap.to(cta, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.55)" }); };
            const onMove = (event) => {
              const rect = cta.getBoundingClientRect();
              const dx = event.clientX - (rect.left + rect.width / 2);
              const dy = event.clientY - (rect.top + rect.height / 2);
              ctaX(gsap.utils.clamp(-6, 6, dx * 0.18));
              ctaY(gsap.utils.clamp(-4, 4, dy * 0.18));
            };
            cta.addEventListener("pointerenter", onEnter);
            cta.addEventListener("pointerleave", onLeave);
            cta.addEventListener("pointermove", onMove, { passive: true });
            contextCleanups.push(() => {
              cta.removeEventListener("pointerenter", onEnter);
              cta.removeEventListener("pointerleave", onLeave);
              cta.removeEventListener("pointermove", onMove);
            });
          });

          // Cinematic grade: one fixed veil dims the page at the extremes (hero + CTA),
          // lifts through the middle — the whole page reads as one continuous film.
          const gradeEl = document.querySelector(".grade-veil");
          if (gradeEl) {
            const grade = gsap.quickSetter(gradeEl, "opacity");
            ScrollTrigger.create({
              start: 0, end: () => document.documentElement.scrollHeight - window.innerHeight, scrub: true,
              onUpdate: (self) => grade(0.05 + Math.pow(Math.abs(self.progress - 0.45) / 0.55, 1.6) * 0.18),
            });
          }

          // Cursor-reactive phone tilt: the device leans ±2° toward the pointer.
          // Driven through CSS custom properties so it composes with the float
          // keyframes (a CSS animation owns `transform`, so GSAP can't write it directly).
          const phone = document.querySelector(".phone-mockup");
          if (phone) {
            const tiltState = { x: 0, y: 0 };
            const applyTilt = () => {
              phone.style.setProperty("--tilt-x", tiltState.x.toFixed(2) + "deg");
              phone.style.setProperty("--tilt-y", tiltState.y.toFixed(2) + "deg");
            };
            const tiltXTo = gsap.quickTo(tiltState, "x", { duration: 0.9, ease: "power3.out", onUpdate: applyTilt });
            const tiltYTo = gsap.quickTo(tiltState, "y", { duration: 0.9, ease: "power3.out", onUpdate: applyTilt });
            const onTilt = (event) => {
              const rect = phone.getBoundingClientRect();
              const nx = gsap.utils.clamp(-1, 1, (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.6));
              const ny = gsap.utils.clamp(-1, 1, (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * 0.6));
              tiltXTo(nx * 2); tiltYTo(-ny * 2);
            };
            window.addEventListener("pointermove", onTilt, { passive: true });
            contextCleanups.push(() => window.removeEventListener("pointermove", onTilt));
          }
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      const communityScroll = { trigger: ".community-scene", start: "top top", end: "bottom bottom", scrub: .9, invalidateOnRefresh: true };
      gsap.fromTo(".community-depth",
        { yPercent: 6, scale: 1.04 },
        { yPercent: -12, scale: 1.14, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.fromTo(".community-particles",
        { yPercent: 8 },
        { yPercent: -10, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.fromTo(".community-particles i",
        { y: (index) => 12 + index % 5 * 8, opacity: .25 },
        { y: (index) => -30 - index % 7 * 12, x: (index) => (index % 2 ? 1 : -1) * (8 + index % 4 * 7), opacity: .65, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.timeline({ scrollTrigger: { ...communityScroll } })
        .set(".community-handoff", { opacity: 0 }, 0)
        .to(".community-handoff", { opacity: 1, y: -24, ease: "sine.inOut", duration: .26 }, .74);
      gsap.fromTo(".pricing-atmosphere", { y: 64, opacity: .35 }, {
        y: -48, opacity: .85, ease: "none",
        scrollTrigger: { trigger: ".pricing-section", start: "top bottom", end: "top 15%", scrub: .9 },
      });
      gsap.to(".hero-content", { autoAlpha: 0, y: -24, ease: "none", scrollTrigger: { trigger: ".hero", start: "bottom 60%", end: "bottom 10%", scrub: .8 } });
      const communityTracks = gsap.utils.toArray(".community-stream-track");
      communityTracks.forEach((track) => {
        // Unique clips traverse only their measured spare height. The last
        // tile still covers the viewport at the end, with no clones or wrap jump.
        gsap.fromTo(track,
          { y: 0 },
          {
            y: () => -Math.max(0, track.offsetHeight - track.parentElement.offsetHeight),
            ease: "none",
            scrollTrigger: { ...communityScroll },
          },
        );
      });

      const communityStory = gsap.timeline({
        scrollTrigger: { ...communityScroll },
      });
      // The heading enters with the arriving stage, before its sticky story
      // starts. Its parent owns this reveal; the later story owns the lines.
      gsap.fromTo(".community-reveal",
        { yPercent: 18, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: {
          trigger: ".community-scene", start: "top 85%", end: "top 25%", scrub: .2,
        } },
      );
      const communityEchoes = gsap.utils.toArray(".community-echoes span");
      communityEchoes.forEach((echo, index) => {
        const at = 1.55 + index * .95;
        communityStory.fromTo(echo,
          { y: -30, scale: .96, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: .8, duration: .9, ease: "expo.out" },
          at,
        );
        if (index > 0) communityStory.to(communityEchoes[index - 1], { autoAlpha: .38, scale: .985, duration: .6, ease: "none" }, at + .46);
        // Each repetition charges the glow behind "Again." a little more.
        communityStory.to(".again-halo", { opacity: .2 + index * .16, scale: 1 + index * .05, duration: .7, ease: "power2.out" }, at);
        communityStory.fromTo(".again-base em", { scale: 1 }, { scale: 1.025, duration: .22, ease: "power2.out", yoyo: true, repeat: 1 }, at);
      });
      communityStory
        // Act 2 — high-end exit: the whole block dollies up-and-past the viewer with a
        // whisper of scale (camera push), kicker dissolves first, echoes cascade behind.
        .to(".community-kicker", { y: -22, autoAlpha: 0, ease: "power1.in", duration: .55 }, 1.42)
        .to(".show-up-line", { y: -96, scale: .94, autoAlpha: .72, transformOrigin: "50% 0%", ease: "power1.inOut", duration: 1.6 }, 1.5)
        .to(".community-copy", { y: () => -Math.max(0, document.querySelector(".community-echoes").offsetHeight - window.innerHeight * .38), ease: "power1.inOut", duration: 3.6 }, 2.75)
        // Section hands off WHILE the last echo is still fresh — the copy block translates
        // away mid-animation so scrolling out feels like continuous motion. The stage itself
        // must stay put: it carries the streams' darkening wash, and moving it exposes an
        // unwashed strip at the section boundary (reads as a hairline seam bug).
        .to(".community-copy", { yPercent: -16, scale: 1.012, autoAlpha: 0, transformOrigin: "50% 100%", ease: "power1.in", duration: .9 }, 6.55);
    }, root);

    // Phone screens wait off-canvas until their push, where lazy loading would
    // never fetch them in time. Warm them once the hero has finished loading.
    const warmScreens = () => root.current?.querySelectorAll(".phone-screen").forEach((image) => { image.loading = "eager"; });
    if (document.readyState === "complete") warmScreens();
    else window.addEventListener("load", warmScreens, { once: true });
    contextCleanupsGlobal.push(() => window.removeEventListener("load", warmScreens));

    const refresh = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) refresh(); });
    window.addEventListener("load", refresh, { once: true });
    return () => {
      mounted = false;
      window.removeEventListener("load", refresh);
      contextCleanups.forEach((cleanup) => cleanup());
      context.revert();
      ambientVideoObserver.disconnect();
      ambientVideos.forEach((video) => video.pause());
      document.removeEventListener("visibilitychange", syncAmbientPlayback);
      gsap.ticker.remove(onTick);
      contextCleanupsGlobal.forEach((cleanup) => cleanup());
      lenis.destroy();
    };
  }, [loaded, reduced]);

  useEffect(() => {
    const anchor = readingAnchor.current;
    if (!anchor) return undefined;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const extent = anchor.section.parentElement.classList.contains("pin-spacer") ? anchor.section.parentElement : anchor.section;
      const bounds = extent.getBoundingClientRect();
      let destination = window.scrollY + bounds.top + anchor.progress * Math.max(0, bounds.height - window.innerHeight);
      if (anchor.section.matches(".training-system")) {
        if (reduced) destination = window.scrollY + anchor.section.querySelectorAll(".chapter")[Math.max(0, anchor.chapter)].getBoundingClientRect().top - 100;
        else destination = window.scrollY + bounds.top + chapterProgress(Math.max(0, anchor.chapter)) * (bounds.height - window.innerHeight);
      }
      if (anchor.atEnd) destination = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: destination, behavior: "instant" });
      ScrollTrigger.update();
      readingAnchor.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <main ref={root} className={`site${loaded ? " is-ready" : ""}${reduced ? " is-motion-off" : ""}`}>
      <a className="skip-link" href="#system">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true" />
      {/* Outside the hero's stacking context so the docked state layers above every section. */}
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Shft — back to top"><span className="brand-wordmark" role="img" aria-label="Shft" /></a>
        <div className="nav-links"><a href="#system">The system</a><a href="#app">The app</a></div>
        <a className="nav-cta" href="#system">Explore Shft <Arrow /></a>
      </nav>
      <div className="preloader" aria-hidden={loaded}>
        <div className="preloader-veil" aria-hidden="true" />
        <div className="preloader-curtain" aria-hidden="true" />
        <div className="preloader-mark"><img src="/media/shft-preloader-icon.png" alt="" /></div>
        <span>Preparing your next session</span>
      </div>
      <section className="hero" id="top" aria-label="Shft introduction">
        <HeroMotion reduced={reduced} />
        <div className="hero-aura" />
        <div className="grade-veil" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-eyebrow">Your next version starts here.</p>
          <h1 className="hero-title"><span className="line">Start the</span><span className="line sage">habit.</span></h1>
          <p className="hero-copy">Your training app for plans, sets, and the next session. A clear plan gets you through the door.</p>
          <div className="hero-actions">
            <span className="coming-soon-status">Coming soon</span>
            <a className="text-link hero-secondary" href="#system">Explore Shft</a>
          </div>
        </div>
        <div className="hero-scroll"><span>Scroll to shift</span><i /></div>
      </section>

      <section className="manifesto" id="system">
        <div className="manifesto-stage">
          <video className="manifesto-video" muted loop playsInline preload="metadata" poster="/media/second-section-video-poster.jpg"><source src="/media/second-section-video-final.mp4" type="video/mp4" /></video>
          <div className="manifesto-video-wash" aria-hidden="true" />
          <p className="section-kicker" data-reveal>Built for your next session.</p>
          <div className="manifesto-grid">
          <h2>You do not need to be ready. <em>Just start.</em></h2>
            <div className="manifesto-copy" data-reveal><p>Library, plan builder, logging, and progression cues in one focused app.</p></div>
          </div>
          <div className="manifesto-trace" aria-hidden="true"><span className="trace-step">Plan it</span><i /><span className="trace-step">Do it</span><i /><span className="trace-step">Repeat it</span></div>
        </div>
      </section>

      <section className="training-system" id="app" aria-label="How Shft works">
        <BuildMediaGrid reduced={reduced} />
        <div className="system-glow" aria-hidden="true" />
        <div className="system-label">The Shft system</div>
        <div className="chapter-stack">
          {chapters.map((chapter, index) => (
            <article className={`chapter ${index === 0 ? "is-active" : ""}`} key={chapter.name}>
              <div className="chapter-index">{chapter.step} / {chapter.name}</div>
              <h2>{chapter.title}</h2>
              <p>{chapter.copy}</p>
              {reduced && <img className="chapter-static-screen" src={chapter.screenImage} alt={chapter.screenAlt} width="430" height="900" loading="lazy" decoding="async" />}
            </article>
          ))}
        </div>
        <div className="phone-mockup" aria-label="Shft app preview">
          <span className="phone-button phone-button-mute" aria-hidden="true" />
          <span className="phone-button phone-button-volume-up" aria-hidden="true" />
          <span className="phone-button phone-button-volume-down" aria-hidden="true" />
          <span className="phone-button phone-button-power" aria-hidden="true" />
          <div className="phone-display">
            {chapters.map((chapter, index) => <img className={`phone-screen ${index === 0 ? "is-current" : ""}`} src={chapter.screenImage} alt={chapter.screenAlt} key={chapter.name} loading="lazy" decoding="async" width="430" height="900" />)}
            <div className="phone-island" aria-hidden="true" />
          </div>
        </div>
        <div className="chapter-nav" aria-hidden="true" />
      </section>

      <section className="community-scene" aria-label="The Shft training community">
        <div className="community-stage">
          <div className="community-depth" aria-hidden="true" />
          <CommunityWall reduced={reduced} />
          <CommunityParticles />
          <div className="community-handoff" aria-hidden="true" />
          <div className="community-copy">
            <p className="community-kicker">The hours you make yours</p>
            <h2 className="community-reveal"><span className="reveal-line show-up-line">Show up.</span><span className="reveal-line again-base"><i className="again-halo" aria-hidden="true" /><em>Again.</em></span></h2>
            <div className="community-echoes" aria-hidden="true"><span><i className="echo-a">A</i>gain.</span><span><i className="echo-a">A</i>gain.</span><span><i className="echo-a">A</i>gain.</span><span><i className="echo-a">A</i>gain.</span><span><i className="echo-a">A</i>gain.</span></div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
        <div className="pricing-atmosphere" aria-hidden="true" />
        <div className="pricing-heading">
          <p className="section-kicker" data-reveal>Simple pricing</p>
          <h2 id="pricing-title">Your training.<br /><em>Your choice.</em></h2>
          <p data-reveal>A free training core. A little more guidance when you want it.</p>
        </div>
        <div className="pricing-plans">
          <article className="pricing-plan" aria-labelledby="free-plan" data-reveal>
            <h3 id="free-plan">Free</h3>
            <p className="plan-price"><span>$0</span><span>Always free</span></p>
            <p className="plan-description">Everything you need to keep showing up.</p>
            <ul><li>Build plans and log unlimited workouts</li><li>Explore the library and add your exercises</li><li>Follow your records and training progress</li><li>Keep your workout history</li></ul>
          </article>
          <article className="pricing-plan pricing-plan-premium" aria-labelledby="premium-plan" data-reveal>
            <h3 id="premium-plan">Premium</h3>
            <p className="plan-price"><span>$2.99</span><span>per month</span></p>
            <p className="plan-description">Your training data. A clearer next step.</p>
            <ul><li>Everything in Free</li><li>See your weekly training-volume balance</li><li>Spot when progress starts to stall</li><li>Get a focused weekly training review</li></ul>
          </article>
        </div>
        <div className="pricing-note" data-reveal><p>Planned launch pricing. Premium features and purchases are not available yet.</p><a href="/support/">Questions about plans <span aria-hidden="true">↗</span></a></div>
      </section>

      <section className="final-cta" aria-label="Explore Shft">
        <picture className="final-artwork" aria-hidden="true">
          <source srcSet="/media/final-shft-background-lossless.avif" type="image/avif" />
          <source srcSet="/media/final-shft-background.webp" type="image/webp" />
          <img src="/media/final-shft-background.webp" alt="" loading="lazy" decoding="async" />
        </picture>
        <div className="final-glow" />
        <div className="final-copy">
          <p className="section-kicker" data-reveal>Coming soon</p>
          <h2>Your next session starts <em>with a plan.</em></h2>
          <p data-reveal>Keep your plan close. Return ready.</p>
          <div className="final-actions" data-reveal><a className="text-link" href="#app">Explore the app</a><a className="text-link" href="/support/">Ask a question</a></div>
        </div>
        <div className="final-phones" aria-hidden="true">
          <img className="final-phone-pixel" src="/media/shft-pixel9-exercises-aligned.png" alt="" loading="lazy" decoding="async" width="1254" height="1254" />
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand" data-reveal>
          <span className="brand-wordmark" role="img" aria-label="Shft" />
          <p>Plans. Sets. Progress.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer" data-reveal>
          <p className="footer-label">Explore Shft</p>
          <a href="#system">The system</a>
          <a href="#app">The app</a>
          <a href="#pricing">Pricing</a>
          <a href="#top">Back to top</a>
        </nav>
        <nav className="footer-legal" aria-label="Help and legal" data-reveal>
          <p className="footer-label">Help &amp; legal</p>
          <a href="/support/">Support</a>
          <a href="/privacy/">Privacy</a>
          <a href="/health-data/">Health data</a>
          <a href="/terms/">Terms</a>
          <a href="/cookies/">Cookies</a>
        </nav>
        <div className="footer-meta" data-reveal>
          <span>© 2026 Shft. All rights reserved.</span>
          <span>Independently built by Apostolos Peiniris.</span>
        </div>
        <div className="footer-actions">
          <a className="ap-signature" href="https://apostolos-peiniris.vercel.app/" target="_blank" rel="noreferrer"><img src="/media/ap-signature.png" alt="Apostolos Peiniris" loading="lazy" decoding="async" /></a>
          <a className="footer-top" href="#top" aria-label="Back to top"><img src="/media/tpainn-github-avatar.png" alt="" width="160" height="160" loading="lazy" decoding="async" /></a>
        </div>
      </footer>
    </main>
  );
}

export default App;
