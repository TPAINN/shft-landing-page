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
    screenImage: "/media/shft-ios-plan-builder.webp",
    screenAlt: "Shft plan builder with a Tuesday lower-body day",
  },
  {
    step: "02",
    name: "Learn",
    title: "Know every lift.",
    copy: "Illustrated technique, the muscles it hits, and cues you can use mid-set.",
    screenImage: "/media/shft-ios-exercise-detail.webp",
    screenAlt: "Shft exercise detail screen for the barbell bench press",
  },
  {
    step: "03",
    name: "Lift",
    title: "Stay with the work.",
    copy: "Log sets, reps, and rest without leaving the floor.",
    screenImage: "/media/shft-ios-active-session.webp",
    screenAlt: "Shft active workout screen",
  },
  {
    step: "04",
    name: "Review",
    title: "See every set count.",
    copy: "Every session ends with your sets, your time, and any new records.",
    screenImage: "/media/shft-ios-session-summary.webp",
    screenAlt: "Shft session summary screen",
  },
  {
    step: "05",
    name: "Recover",
    title: "Train what is ready.",
    copy: "Recovery clocks built from your own sessions show which days are ready and which muscles still need time.",
    screenImage: "/media/shft-ios-recovery.webp",
    screenAlt: "Shft recovery screen with each plan day's readiness and a muscle map",
  },
  {
    step: "06",
    name: "Progress",
    title: "See what to do next.",
    copy: "A weekly streak and a volume heatmap show where to add work next.",
    screenImage: "/media/shft-ios-progress.webp",
    screenAlt: "Shft progress screen with the weekly streak and volume heatmap",
  },
];

const buildGridMedia = [
  { type: "video", src: "/media/build-reset.mp4" },
  { type: "video", src: "/media/build-redplates.mp4" },
  { type: "image", src: "/media/build-pulldown.webp" },
  { type: "video", src: "/media/build-squat.mp4" },
  { type: "image", src: "/media/build-barbell.webp" },
  { type: "image", src: "/media/ambient-lifter.webp" },
];

const communityParticles = Array.from({ length: 56 }, (_, index) => ({
  x: `${(index * 29 + 7) % 96 + 2}%`,
  y: `${(index * 37 + 11) % 94 + 3}%`,
  size: `${index % 7 === 0 ? 6 : index % 3 === 0 ? 3.5 : 2}px`,
  trail: `${24 + index % 5 * 9}px`,
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

  return <div className="hero-motion" aria-hidden="true"><video ref={video} autoPlay={!reduced} muted loop playsInline preload="auto" fetchPriority="high" poster="/media/hero-motion-poster.webp"><source src="/media/hero-motion-mobile-pingpong.mp4" media="(max-width: 820px)" type="video/mp4" /><source src="/media/hero-motion-desktop-pingpong.mp4" type="video/mp4" /></video></div>;
}

function BuildMediaGrid({ reduced }) {
  if (reduced) return null;
  // Media budget: phones render fewer tiles, videos poster-first.
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const tiles = isTouch ? buildGridMedia.slice(0, 4) : buildGridMedia;
  return <div className="build-media-grid" aria-hidden="true">
    {tiles.map((asset) => <div className="build-media-tile" key={asset.src}>
      {asset.type === "video"
        ? <video muted loop playsInline preload="none" poster={asset.src.replace(".mp4", ".webp")}>
          {/* Phones decode a 480px/24fps cut: the dimmed tiles never need more. */}
          <source src={asset.src.replace(".mp4", "-mobile.mp4")} media="(max-width: 820px)" type="video/mp4" />
          <source src={asset.src} type="video/mp4" />
        </video>
        : <img src={asset.src} alt="" loading="lazy" decoding="async" />}
    </div>)}
  </div>;
}

// Three depth layers move as whole planes: 3 composited layers and 3 scroll
// tweens instead of one per particle, with the same parallax spread.
const PARTICLE_LAYERS = 3;

/* The final stage's only motion besides the phone: a few dust motes drifting upward through the
   dark, slow enough to read as air rather than effect. Paused off screen and in background tabs;
   a single still frame when motion is reduced. */
function FinalParticles({ reduced }) {
  const canvas = useRef(null);
  useEffect(() => {
    const el = canvas.current; if (!el) return undefined;
    const ctx = el.getContext("2d"); let raf = 0, visible = false, w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const motes = Array.from({ length: 70 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: .5 + Math.random() * 1.6,
      v: .006 + Math.random() * .014, drift: (Math.random() - .5) * .004, a: .12 + Math.random() * .38, tw: Math.random() * Math.PI * 2 }));
    const size = () => { w = el.clientWidth; h = el.clientHeight; el.width = w * dpr; el.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        if (!reduced) { m.y -= m.v / 60; m.x += m.drift / 60; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); } }
        const glow = m.a * (.75 + .25 * Math.sin(t / 1600 + m.tw));
        ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 240, 205, ${glow.toFixed(3)})`; ctx.fill();
      }
    };
    const loop = (t) => { draw(t); raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduced) raf = requestAnimationFrame(loop); });
    const onVis = () => { if (!document.hidden && visible && !raf && !reduced) raf = requestAnimationFrame(loop); };
    size(); draw(0); io.observe(el);
    window.addEventListener("resize", size); document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", onVis); };
  }, [reduced]);
  return <canvas ref={canvas} className="final-particles" aria-hidden="true" />;
}

/* iPhone 18 Pro Max (mockups-design.com, royalty-free) around a frame-exact 60 fps recording of the
   app's welcome screen. The video loads and plays only while the phone is on screen. */
function FinalPhone({ reduced }) {
  const video = useRef(null);
  useEffect(() => {
    const v = video.current; if (!v || reduced) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    }, { rootMargin: "200px 0px" });
    const onVis = () => { if (document.hidden) v.pause(); };
    io.observe(v); document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [reduced]);
  return <div className="final-device">
    <div className="final-device-screen">
      {reduced
        ? <img src="/media/shft-welcome-poster.webp" alt="" loading="lazy" decoding="async" />
        : <video ref={video} muted loop playsInline preload="none" poster="/media/shft-welcome-poster.webp">
            <source src="/media/shft-welcome-loop.webm" type="video/webm" />
            <source src="/media/shft-welcome-loop.mp4" type="video/mp4" />
          </video>}
    </div>
    <img className="final-device-frame" src="/media/iphone18-frame.webp" alt="" width="1061" height="2194" loading="lazy" decoding="async" />
  </div>;
}

function CommunityParticles() {
  return <div className="community-particles" aria-hidden="true">
    {Array.from({ length: PARTICLE_LAYERS }, (_, layer) => <div className="community-particle-layer" key={layer}>
      {communityParticles.filter((_, index) => index % PARTICLE_LAYERS === layer).map((particle) => <i key={particle.x + particle.y} style={{
        "--particle-x": particle.x,
        "--particle-y": particle.y,
        "--particle-size": particle.size,
        "--particle-trail": particle.trail,
      }} />)}
    </div>)}
  </div>;
}

function CommunityClip({ src, active, showPoster }) {
  // Posters load once the scene is near (or at once in the static reduced-motion
  // edition, where the posters are the content) — not with the hero.
  return <div className="community-stream-tile">
    <video muted loop playsInline preload="none" poster={showPoster ? src.replace(/(?:-compact)?\.mp4$/, ".webp") : undefined}>
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
          {media.map((src) => <CommunityClip src={src} active={near && !reduced} showPoster={near || reduced} key={src} />)}
        </div>
      </div>
    </div>)}
  </div>;
}

/* The Android build hosted on this site. Version, size and minimum Android are read off the build. */
const APK = { href: "/download/shft-1.20.1.apk", version: "1.20.1", size: "21 MB", android: "Android 7+" };
const PRICES = {
  monthly: { price: "$2.99", per: "per month", note: "Cancel any time" },
  yearly: { price: "$23.99", per: "per year", note: "About $2.00 a month · save 33%" },
};

function DownloadButton({ className = "" }) {
  return <a className={`download-cta ${className}`} href={APK.href} download aria-label={`Download Shft ${APK.version} for Android, ${APK.size}`}>Download for Android <Arrow /></a>;
}

function App() {
  const [billing, setBilling] = useState("yearly");
  const internalArrival = Boolean(document.referrer && new URL(document.referrer).origin === window.location.origin);
  // The reveal is imperative, not state: re-rendering this whole tree on the
  // curtain's first frame is exactly what made the exit stutter.
  const revealed = useRef(internalArrival);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const root = useRef(null);
  const readingAnchor = useRef(null);
  const introRef = useRef(null);
  const lenisRef = useRef(null);

  const reveal = () => {
    if (revealed.current) return;
    revealed.current = true;
    root.current.classList.add("is-ready");
    root.current.querySelector(".preloader").setAttribute("aria-hidden", "true");
    lenisRef.current?.start();
    introRef.current?.play();
  };
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
      setReduced(event.matches);
    };
    preference.addEventListener("change", onPreferenceChange);
    return () => preference.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const boot = document.getElementById("boot");
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const imageReady = (src) => new Promise((resolve) => { const image = new Image(); image.onload = image.onerror = resolve; image.src = src; });
    // Hand-off: once the boot mark's entrance settles, the React preloader's
    // identical mark sits beneath it, so removing the boot layer is invisible.
    // On internal arrivals (preloader skipped) the boot layer fades instead.
    const handOff = Promise.all(boot ? boot.getAnimations({ subtree: true }).map((animation) => animation.finished) : [])
      .then(() => imageReady("/media/shft-preloader-icon.webp"));
    let cancelled = false;
    handOff.then(() => {
      if (cancelled || !boot?.isConnected) return;
      if (internalArrival) { boot.classList.add("is-gone"); boot.addEventListener("transitionend", () => boot.remove(), { once: true }); }
      else boot.remove();
    });
    // Leave when the first frame is genuinely ready (fonts + hero poster),
    // never before a short brand beat, and never later than a hard cap.
    const ready = Promise.all([wait(reduced ? 80 : 700), handOff, document.fonts.ready, imageReady("/media/hero-motion-poster.webp")]);
    Promise.race([ready, wait(reduced ? 400 : 3200)]).then(() => {
      if (cancelled) return;
      if (!internalArrival) boot?.remove();
      reveal();
    });
    // One fixed bar for the whole page: the moment the page leaves the hero's
    // first frame it floats on a frosted-glass backing. Content never re-lays out.
    const chrome = document.querySelector(".site-nav");
    const onChromeScroll = () => chrome.classList.toggle("is-docked", window.scrollY > 24);
    onChromeScroll();
    window.addEventListener("scroll", onChromeScroll, { passive: true });
    return () => { cancelled = true; window.removeEventListener("scroll", onChromeScroll); };
  }, []);

  // All scroll machinery is built while the preloader still covers the page, so
  // its ~400ms setup never lands on the curtain's exit frames. Scrolling stays
  // locked until the reveal; the intro plays on reveal (see the effect below).
  useEffect(() => {
    if (reduced) return undefined;

    const contextCleanupsGlobal = [];
    const contextCleanups = [];
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      lerp: .1, smoothWheel: true, wheelMultiplier: 1, anchors: false,
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
    lenisRef.current = lenis;
    if (!revealed.current) lenis.stop();
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

    const ambientVideos = root.current ? [...root.current.querySelectorAll(".manifesto-video, .final-light")] : [];
    const visibleAmbientVideos = new Set();
    const syncAmbientPlayback = () => ambientVideos.forEach((video) => {
      if (visibleAmbientVideos.has(video) && !document.hidden) video.play().catch(() => {});
      else video.pause();
    });
    const ambientVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visibleAmbientVideos.add(entry.target) : visibleAmbientVideos.delete(entry.target));
      syncAmbientPlayback();
    }, { threshold: 0.08 });
    ambientVideos.forEach((video) => ambientVideoObserver.observe(video));
    document.addEventListener("visibilitychange", syncAmbientPlayback);
    // Floating phones only animate while on screen and the tab is visible.
    const floatingPhones = [...root.current.querySelectorAll(".final-device, .phone-mockup")];
    const visiblePhones = new Set();
    const syncPhoneMotion = () => floatingPhones.forEach((phone) => {
      phone.style.animationPlayState = visiblePhones.has(phone) && !document.hidden ? "running" : "paused";
    });
    const phoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visiblePhones.add(entry.target) : visiblePhones.delete(entry.target));
      syncPhoneMotion();
    });
    floatingPhones.forEach((phone) => phoneObserver.observe(phone));
    syncPhoneMotion();
    document.addEventListener("visibilitychange", syncPhoneMotion);
    contextCleanupsGlobal.push(() => { phoneObserver.disconnect(); document.removeEventListener("visibilitychange", syncPhoneMotion); floatingPhones.forEach((phone) => { phone.style.animationPlayState = ""; }); });

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
      introRef.current = intro;
      if (revealed.current) intro.progress(1);

      // Top bar docking is scrubbed, not toggled: glass and lift track the first
      // 180px of scroll with a short inertial lag, identical in both directions.
      gsap.fromTo(".site-nav", { "--dock": 0 }, {
        "--dock": 1, ease: "power1.inOut",
        scrollTrigger: { start: 0, end: 180, scrub: .5 },
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
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .5 },
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

      // Masked line reveals on section headings. autoSplit re-splits once web
      // fonts load and whenever the width changes, so line breaks always match
      // the real font; returning the tween lets SplitText rebuild it in place.
      gsap.utils.toArray(".manifesto h2, .pricing-section h2, .final-cta h2").forEach((heading) => {
        SplitText.create(heading, {
          type: "lines", linesClass: "split-line", autoSplit: true,
          onSplit: (self) => gsap.fromTo(self.lines, { yPercent: 58, clipPath: "inset(-8% 0 100% 0)" }, {
            yPercent: 0,
            clipPath: "inset(-8% 0 -14% 0)",
            duration: 1.05,
            ease: "power4.out",
            stagger: 0.09,
            scrollTrigger: { trigger: heading, endTrigger: heading.closest("section"), start: "top 85%", end: "bottom top", toggleActions: "play reverse play reverse" },
          }),
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
      const SYSTEM_HOLD_END = `+=${chapters.length * (isTouch ? 46 : 66)}%`;
      let buildMediaPlaying = false;
      const setBuildMediaPlayback = (shouldPlay) => {
        if (shouldPlay === buildMediaPlaying) return;
        buildMediaPlaying = shouldPlay;
        buildVideos.forEach((video) => shouldPlay ? video.play().catch(() => {}) : video.pause());
      };
      const systemStory = gsap.timeline({
        scrollTrigger: {
          trigger: ".training-system", start: "top top", end: SYSTEM_HOLD_END, pin: true,
          scrub: 0.5, anticipatePin: 1,
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
          // A clip wipe: the next screen is uncovered from the right edge while the one under it
          // settles back a touch and dims - one surface turning a page, not two images sliding.
          .to(phoneScreens[index - 1], { xPercent: -6, scale: .96, autoAlpha: .55, duration: 1, ease: "power2.inOut" }, at)
          .fromTo(phoneScreens[index], { xPercent: 10, autoAlpha: 1, scale: 1, clipPath: "inset(0% 0% 0% 100% round 0px)" },
            { xPercent: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power3.inOut" }, at)
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

      const communityScroll = { trigger: ".community-scene", start: "top top", end: "bottom bottom", scrub: .5, invalidateOnRefresh: true };
      gsap.fromTo(".community-depth",
        { yPercent: 6, scale: 1.04 },
        { yPercent: -12, scale: 1.14, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.fromTo(".community-particles",
        { yPercent: 8 },
        { yPercent: -10, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.fromTo(".community-particle-layer",
        { y: (depth) => 12 + depth * 14, opacity: .25 },
        { y: (depth) => -30 - depth * 34, x: (depth) => (depth - 1) * 16, opacity: .65, ease: "none", scrollTrigger: { ...communityScroll } },
      );
      gsap.timeline({ scrollTrigger: { ...communityScroll } })
        .set(".community-handoff", { opacity: 0 }, 0)
        .to(".community-handoff", { opacity: 1, y: -24, ease: "sine.inOut", duration: .26 }, .74);
      gsap.fromTo(".pricing-atmosphere", { y: 64, opacity: .35 }, {
        y: -48, opacity: .85, ease: "none",
        scrollTrigger: { trigger: ".pricing-section", start: "top bottom", end: "top 15%", scrub: .5 },
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

      // Text fill: body lines that matter are written in, word by word, as they cross the
      // reading line - dim ink fills to full as the page moves, and empties again on the way back.
      gsap.utils.toArray(".fill-reveal").forEach((paragraph) => {
        SplitText.create(paragraph, {
          type: "words", wordsClass: "fill-word", autoSplit: true,
          onSplit: (self) => gsap.fromTo(self.words, { opacity: .16 }, {
            opacity: 1, ease: "none", stagger: .08,
            scrollTrigger: { trigger: paragraph, start: "top 88%", end: "top 52%", scrub: .6 },
          }),
        });
      });

      // Accent words get a light pass once their line has landed: a soft sheen crosses the
      // mint fill left to right, so the emphasis is felt rather than just coloured.
      gsap.utils.toArray(".hero-title .sage, .manifesto h2 em, .pricing-section h2 em, .final-cta h2 em, .community-reveal .again-gain").forEach((word) => {
        word.classList.add("fill-sheen");
        ScrollTrigger.create({ trigger: word, start: "top 80%", once: true, onEnter: () => gsap.delayedCall(word.closest(".hero") ? 1.5 : .7, () => word.classList.add("is-lit")) });
      });

      // Section seams: each chapter arrives inset with rounded corners and opens to full bleed
      // as it reaches the top, so the page reads as one continuous piece turning, not stacked blocks.
      const seam = isTouch ? "inset(14px 12px 0px 12px round 26px)" : "inset(40px 2.6vw 0px 2.6vw round 40px)";
      const open = isTouch ? "inset(0px 0px 0px 0px round 0px)" : "inset(0px 0vw 0px 0vw round 0px)";
      gsap.utils.toArray(".manifesto, .training-system, .community-scene, .pricing-section").forEach((section) => {
        gsap.fromTo(section, { clipPath: seam }, {
          clipPath: open, ease: "power1.out",
          scrollTrigger: { trigger: section, start: "top bottom", end: "top 18%", scrub: .6 },
        });
      });

      gsap.fromTo(".final-stage", { scale: .955, borderRadius: isTouch ? 34 : 64 }, {
        scale: 1, borderRadius: isTouch ? 28 : 48, ease: "power1.out",
        scrollTrigger: { trigger: ".final-cta", start: "top bottom", end: "top 25%", scrub: .6 },
      });

      const communityStory = gsap.timeline({
        scrollTrigger: { ...communityScroll },
      });
      // Act 1 - the two lines rise out of a mask, one after the other, as the stage arrives.
      gsap.fromTo(".community-kicker", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: {
        trigger: ".community-scene", start: "top 80%", end: "top 45%", scrub: .3,
      } });
      gsap.fromTo(".community-reveal .reveal-inner",
        { yPercent: 55, autoAlpha: 0, clipPath: "inset(0% -30% 100% -30%)" },
        { yPercent: 0, autoAlpha: 1, clipPath: "inset(-60% -30% -60% -30%)", stagger: .45, ease: "power3.out", scrollTrigger: {
          trigger: ".community-scene", start: "top 72%", end: "top 12%", scrub: .35,
        } },
      );
      // Act 2 - one slow beat instead of five reps: the A of "Again." fades away over a long
      // stretch of scroll while the word glides back to centre, so the line ends on "Gain."
      // The halo charges once, gently. Offsets are measured, so any font size stays centred.
      const againA = root.current.querySelector(".again-a");
      const halfA = () => -(againA ? againA.getBoundingClientRect().width / 2 : 0);
      communityStory
        .to(".again-a", { autoAlpha: 0, yPercent: -6, scale: .96, transformOrigin: "50% 60%", duration: 2.4, ease: "sine.inOut" }, 1.8)
        .to(".again-a, .again-gain", { x: halfA, duration: 2.4, ease: "sine.inOut" }, 1.8)
        .to(".again-halo", { opacity: .62, scale: 1.12, duration: 2.4, ease: "sine.inOut" }, 1.8);
      communityStory
        .to(".show-up-line", { autoAlpha: .62, duration: 1.2, ease: "power1.inOut" }, 1.5)
        // Act 3 - the whole block leaves together, a soft push back and fade, well before the
        // section boundary. The stage stays put: it carries the streams' darkening wash.
        .to(".community-copy", { y: -28, scale: .975, autoAlpha: 0, ease: "power1.in", duration: .9 }, 6.4);
    }, root);

    // Phone screens wait off-canvas until their push, where lazy loading would
    // never fetch them in time. After the hero loads, fetch and pre-decode them
    // off the main thread so a push never stalls a frame on image decode.
    const warmScreens = () => root.current?.querySelectorAll(".phone-screen").forEach((image) => {
      image.loading = "eager";
      image.decode().catch(() => {});
    });
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
      lenisRef.current = null;
      introRef.current = null;
    };
  }, [reduced]);

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
    <main ref={root} className={`site${revealed.current ? " is-ready" : ""}${reduced ? " is-motion-off" : ""}`}>
      <a className="skip-link" href="#system">Skip to content</a>
      {/* Outside the hero's stacking context so the docked state layers above every section. */}
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Shft — back to top"><span className="brand-wordmark" role="img" aria-label="Shft" /></a>
        <div className="nav-links"><a href="#system">The system</a><a href="#app">The app</a></div>
        <a className="nav-cta" href={APK.href} download>Download <Arrow /></a>
      </nav>
      <div className="preloader" aria-hidden={revealed.current}>
        <div className="preloader-veil" aria-hidden="true" />
        <div className="preloader-curtain" aria-hidden="true" />
        <div className="preloader-mark"><img src="/media/shft-preloader-icon.webp" alt="" width="94" height="94" /></div>
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
            <DownloadButton />
            <a className="text-link hero-secondary" href="#system">Explore Shft</a>
          </div>
          <p className="download-meta">Free · {APK.android} · v{APK.version} · {APK.size} · Google Play coming soon</p>
        </div>
        <div className="hero-scroll"><span>Scroll to shift</span><i /></div>
      </section>

      <section className="manifesto" id="system">
        <div className="manifesto-stage">
          <video className="manifesto-video" muted loop playsInline preload="none" poster="/media/second-section-video-poster.webp"><source src="/media/second-section-video-final.mp4" type="video/mp4" /></video>
          <div className="manifesto-video-wash" aria-hidden="true" />
          <p className="section-kicker" data-reveal>Built for your next session.</p>
          <div className="manifesto-grid">
          <h2>You do not need to be ready. <em>Just start.</em></h2>
            <div className="manifesto-copy"><p className="fill-reveal">Library, plan builder, logging, and progression cues in one focused app.</p></div>
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
      </section>

      <section className="community-scene" aria-label="The Shft training community">
        <div className="community-stage">
          <div className="community-depth" aria-hidden="true" />
          <CommunityWall reduced={reduced} />
          <CommunityParticles />
          <div className="community-handoff" aria-hidden="true" />
          <div className="community-copy">
            <p className="community-kicker">Strength is repetition</p>
            <h2 className="community-reveal">
              <span className="reveal-line show-up-line"><span className="reveal-inner">Show up.</span></span>
              <span className="reveal-line again-base">
                <i className="again-halo" aria-hidden="true" />
                {/* Show up again, and the A falls away: what is left is the gain. */}
                <em className="reveal-inner"><span className="again-a">A</span><span className="again-gain">gain.</span></em>
              </span>
            </h2>
            <p className="community-sub">Every session you repeat builds on the last. Shft keeps the count, so each return starts from your best.</p>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
        <div className="pricing-atmosphere" aria-hidden="true" />
        <div className="pricing-heading">
          <p className="section-kicker" data-reveal>Simple pricing</p>
          <h2 id="pricing-title">Train free.<br /><em>Add a coach.</em></h2>
          <p className="fill-reveal">The whole training app is free, with no ads and no exercise paywall. Premium reads your week and tells you what to do next.</p>
          <div className="billing-toggle" role="radiogroup" aria-label="Billing period" data-reveal>
            {["monthly", "yearly"].map((k) => (
              <button key={k} type="button" role="radio" aria-checked={billing === k} className={billing === k ? "is-on" : ""} onClick={() => setBilling(k)}>
                {k === "monthly" ? "Monthly" : "Yearly"}{k === "yearly" && <span className="billing-save">−33%</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="pricing-plans">
          <article className="pricing-plan" aria-labelledby="free-plan" data-reveal>
            <h3 id="free-plan">Free</h3>
            <p className="plan-price"><span>$0</span><span>Forever</span></p>
            <p className="plan-description">Everything you need to train, log and progress.</p>
            <ul>
              <li>Every exercise illustrated, with technique cues</li>
              <li>Unlimited plans, splits and logged sessions</li>
              <li>Records, trends and all-time bests</li>
              <li>Recovery clocks for every muscle</li>
              <li>Cloud backup to your account</li>
            </ul>
            <DownloadButton className="plan-cta" />
          </article>
          <article className="pricing-plan pricing-plan-premium" aria-labelledby="premium-plan" data-reveal>
            <h3 id="premium-plan">Premium <span className="plan-tag">Coaching layer</span></h3>
            <p className="plan-price" aria-live="polite"><span>{PRICES[billing].price}</span><span>{PRICES[billing].per}</span></p>
            <p className="plan-description">{PRICES[billing].note}. Your training data, turned into a clear next step.</p>
            <ul>
              <li>Everything in Free</li>
              <li>Weekly volume heatmap against evidence-based targets</li>
              <li>Plateau alerts with a deload plan when a lift stalls</li>
              <li>A coach review of your week, every week</li>
            </ul>
            <p className="plan-cta-note">Pay by card in the Android download, cancel any time. Google Play billing arrives with the Play release.</p>
          </article>
        </div>
        <div className="pricing-note" data-reveal><p>Prices in USD; your store shows your local price. No ads, and your training data is never sold.</p><a href="/support/">Questions about plans <span aria-hidden="true">↗</span></a></div>
      </section>

      <section className="final-cta" aria-label="Explore Shft">
        {/* Sized to what each screen actually shows: phones get an exact crop of the
            visible slice, desktops a width-matched render, never the 14 MP master. */}
        <FinalParticles reduced={reduced} />
        <div className="final-stage" aria-hidden="true">
          {/* Light loop made in EffectCraft (design/effects/final_light.jsx): fog and slow shafts on black, screen-blended. */}
          {!reduced && <video className="final-light" muted loop playsInline preload="metadata" tabIndex={-1}><source src="/media/final-light.webm" type="video/webm" /><source src="/media/final-light.mp4" type="video/mp4" /></video>}
          <i className="final-spot" /><i className="final-floor" /><i className="final-rim" />
        </div>
        <div className="final-glow" />
        <div className="final-copy">
          <p className="section-kicker" data-reveal>Out now on Android</p>
          <h2>Your next session starts <em>with a plan.</em></h2>
          <p className="fill-reveal">Free to download. Google Play coming soon.</p>
          <div className="final-actions" data-reveal><DownloadButton /><a className="text-link" href="/support/">Ask a question</a></div>
        </div>
        <div className="final-phones" aria-hidden="true">
          <FinalPhone reduced={reduced} />
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
          <p className="footer-label footer-built">Built by</p>
          <a className="ap-signature" href="https://apostolos-peiniris.vercel.app/" target="_blank" rel="noreferrer"><img src="/media/ap-signature.webp" alt="Apostolos Peiniris" loading="lazy" decoding="async" /></a>
          <a className="footer-top" href="#top" aria-label="Back to top"><img src="/media/tpainn-github-avatar.webp" alt="" width="160" height="160" loading="lazy" decoding="async" /></a>
        </div>
      </footer>
    </main>
  );
}

export default App;
