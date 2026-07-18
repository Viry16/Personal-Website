"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";

// True on devices that can't hover (touch/coarse pointers). Used to reveal
// hover-gated content by default so it's accessible on mobile.
const subscribeHover = (cb: () => void) => {
  const mq = window.matchMedia("(hover: none)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
function useNoHover() {
  return useSyncExternalStore(
    subscribeHover,
    () => window.matchMedia("(hover: none)").matches,
    () => false // SSR: assume a hover-capable device
  );
}

interface Photo {
  id: string;
  place: string;
  sub: string;
  title1: string;
  title2: string;
  title3: string;
  src: string;
}

const PHOTOS: Photo[] = [
  {
    id: "photo-0",
    place: "Excel",
    sub: "Cikarang, Indonesia · May 2026",
    title1: "Life every",
    title2: "day like",
    title3: "it's your last",
    src: "/image/profile_image/excel.webp", // User will replace
  },
  {
    id: "photo-1",
    place: "WICE 2026",
    sub: "President University · April 2026",
    title1: "WICE",
    title2: "Silver",
    title3: "Medalist.",
    src: "/image/profile_image/wice.webp", // User will replace
  },
  {
    id: "photo-2",
    place: "Gunung Gede",
    sub: "Cianjur, Indonesia · March 2026",
    title1: "Conquering",
    title2: "peaks and",
    title3: "dreams.",
    src: "/image/profile_image/gede.webp", // User will replace
  },
  {
    id: "photo-3",
    place: "Borobudur",
    sub: "Magelang, Indonesia · March 2026",
    title1: "Sunrise over",
    title2: "ancient",
    title3: "stupa.",
    src: "/image/profile_image/borobudur.webp", // User will replace
  },
];

interface ProfileCardProps {
  name?: string;
  accent?: string;
  idleSeconds?: number;
  scale?: number;
}

export default function ProfileCard({
  accent = "#16c47f",
  idleSeconds = 6,
  scale = 1,
}: ProfileCardProps) {
  const [mode, setMode] = useState<"card" | "gallery">("card");
  const [cardHover, setCardHover] = useState(false);
  const [deckHover, setDeckHover] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stageIn, setStageIn] = useState(true);

  // Entrance animation: card rises into view with a 3D tilt on first mount.
  const [mounted, setMounted] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  
  const startXRef = useRef(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimer1Ref = useRef<NodeJS.Timeout | null>(null);
  const fadeTimer2Ref = useRef<NodeJS.Timeout | null>(null);
  // Drag is throttled to one state update per animation frame (pointermove can
  // fire far faster than 60Hz, which caused a re-render storm).
  const dragRafRef = useRef<number | null>(null);
  const latestDragXRef = useRef(0);

  const noHover = useNoHover();

  function crossFade(nextState: { mode?: "card" | "gallery", cardHover?: boolean, deckHover?: boolean, dragging?: boolean, dragX?: number }) {
    if (fadeTimer1Ref.current) clearTimeout(fadeTimer1Ref.current);
    if (fadeTimer2Ref.current) clearTimeout(fadeTimer2Ref.current);
    
    setStageIn(false);
    fadeTimer1Ref.current = setTimeout(() => {
      if (nextState.mode) setMode(nextState.mode);
      if (nextState.cardHover !== undefined) setCardHover(nextState.cardHover);
      if (nextState.deckHover !== undefined) setDeckHover(nextState.deckHover);
      if (nextState.dragging !== undefined) setDragging(nextState.dragging);
      if (nextState.dragX !== undefined) setDragX(nextState.dragX);
      
      fadeTimer2Ref.current = setTimeout(() => {
        setStageIn(true);
      }, 30);
    }, 280);
  }

  function exitGallery() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    crossFade({ mode: "card", deckHover: false, dragging: false, dragX: 0 });
  }

  function enterGallery() {
    crossFade({ mode: "gallery", cardHover: false });
    resetIdle();
  }

  function resetIdle() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setMode((prevMode) => {
        if (prevMode === "gallery") {
          exitGallery();
        }
        return prevMode;
      });
    }, idleSeconds * 1000);
  }

  // Trigger the entrance animation on mount. No delay so the image paints
  // immediately (opacity is never 0 — Chrome needs it visible for LCP).
  useEffect(() => {
    // Use a microtask so the pre-transform state renders one frame first
    requestAnimationFrame(() => setMounted(true));
    const entranceEnd = setTimeout(() => setEntranceDone(true), 1200);
    return () => {
      clearTimeout(entranceEnd);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (fadeTimer1Ref.current) clearTimeout(fadeTimer1Ref.current);
      if (fadeTimer2Ref.current) clearTimeout(fadeTimer2Ref.current);
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  const onDown = (e: React.PointerEvent<HTMLDivElement>, photoId: string) => {
    const topId = PHOTOS[activeIndex].id;
    if (photoId !== topId) return;
    
    startXRef.current = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    
    resetIdle();
    setDragging(true);
    setDragX(0);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    latestDragXRef.current = e.clientX - startXRef.current;
    // Coalesce rapid pointermove events into at most one update per frame
    if (dragRafRef.current !== null) return;
    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = null;
      resetIdle();
      setDragX(latestDragXRef.current);
    });
  };

  const onUp = () => {
    if (!dragging) return;
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    const dx = latestDragXRef.current;
    const n = PHOTOS.length;
    let i = activeIndex;
    if (dx <= -110) i = (i + 1) % n;
    else if (dx >= 110) i = (i - 1 + n) % n;

    resetIdle();
    latestDragXRef.current = 0;
    setDragging(false);
    setDragX(0);
    setActiveIndex(i);
  };

  const n = PHOTOS.length;
  const active = PHOTOS[activeIndex] || PHOTOS[0];

  // On touch/no-hover devices, reveal the hover content by default so it's
  // reachable without a pointer.
  const cardShowHover = cardHover || noHover;

  // Entrance: 3D perspective tilt rising into place on first load.
  // IMPORTANT: opacity is NEVER 0 during entrance — Chrome disqualifies
  // opacity:0 elements from Largest Contentful Paint. The image must be
  // considered "painted" immediately. Only transform animates on entrance.
  // After entrance completes, crossfade transitions can use opacity+blur.
  const stageStyle: React.CSSProperties = entranceDone
    ? {
        // Post-entrance: normal crossfade transitions (card ↔ gallery)
        opacity: stageIn ? 1 : 0,
        transform: stageIn ? "scale(1)" : "scale(0.93)",
        filter: stageIn ? "blur(0px)" : "blur(6px)",
        transition: "opacity .3s ease, transform .42s cubic-bezier(.22,1,.36,1), filter .3s ease",
        willChange: "opacity, transform",
      }
    : {
        // Entrance: transform-only animation (no opacity/blur gatekeeping)
        opacity: 1,
        transform: mounted
          ? "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)"
          : "perspective(800px) rotateX(6deg) rotateY(-3deg) scale(0.92) translateY(30px)",
        transition: mounted
          ? "transform .9s cubic-bezier(.22,1,.36,1)"
          : "none",
        willChange: "transform",
      };

  // Card view styles
  const imageWrapStyle: React.CSSProperties = {
    position: "absolute",
    top: "14px",
    left: "14px",
    right: "14px",
    bottom: cardShowHover ? "14px" : "104px",
    borderRadius: "20px",
    overflow: "hidden",
    transition: "top .5s cubic-bezier(.22,1,.36,1),left .5s cubic-bezier(.22,1,.36,1),right .5s cubic-bezier(.22,1,.36,1),bottom .5s cubic-bezier(.22,1,.36,1),border-radius .5s",
  };

  const gradientStyle: React.CSSProperties = {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    borderRadius: "30px",
    background: "linear-gradient(to top, rgba(20,20,22,1) 0%, rgba(20,20,22,0) 60%)",
    opacity: cardShowHover ? 1 : 0,
    transition: "opacity .45s",
  };

  const defaultInfoStyle: React.CSSProperties = {
    position: "absolute",
    left: "20px",
    right: "20px",
    bottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    opacity: cardShowHover ? 0 : 1,
    transform: cardShowHover ? "translateY(12px)" : "none",
    transition: "opacity .3s, transform .5s cubic-bezier(.22,1,.36,1)",
    pointerEvents: cardShowHover ? "none" : "auto",
  };

  const hoverInfoStyle: React.CSSProperties = {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    opacity: cardShowHover ? 1 : 0,
    transform: cardShowHover ? "none" : "translateY(14px)",
    transition: "opacity .4s .05s, transform .55s cubic-bezier(.22,1,.36,1)",
    pointerEvents: "none",
  };

  const fan = [
    { r: 0, x: 0, y: 0, s: 1 },
    { r: -6, x: -20, y: 12, s: 0.95 },
    { r: 6, x: 20, y: 20, s: 0.9 },
    { r: 0, x: 0, y: 30, s: 0.86 },
  ];

  return (
    <div 
      className="font-sans relative" 
      style={{ 
        fontFamily: "var(--font-sans)",
        width: 340 * scale,
        height: 500 * scale,
        perspective: "1200px",
      }}
    >
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: 340,
          height: 500,
          transformStyle: "preserve-3d" as const,
        }}
        className="absolute top-0 left-0 flex items-center justify-center"
      >
      {mode === "card" && (
        <div style={stageStyle} className="relative z-10 w-full max-w-sm flex items-center justify-center mx-auto text-left">
          <div
            onMouseEnter={() => setCardHover(true)}
            onMouseLeave={() => setCardHover(false)}
            onClick={enterGallery}
            className="relative w-[340px] h-[500px] bg-[#141416] rounded-[30px] overflow-hidden cursor-pointer"
            style={{
              boxShadow: mounted && !entranceDone
                ? `0 40px 80px -30px rgba(0,0,0,0.8), 0 0 40px -10px ${accent}30`
                : "0 40px 80px -30px rgba(0,0,0,0.8)",
              transition: "box-shadow 1.2s ease-out",
            }}
          >
            <div style={imageWrapStyle}>
              <Image
                src={active.src}
                alt={active.place}
                fill
                sizes="340px"
                priority
                className="object-cover"
              />
            </div>

            <div style={gradientStyle}></div>

            {/* Default Profile Info (Now Location) */}
            <div style={defaultInfoStyle}>
              <div className="text-[10.5px] font-bold tracking-[0.18em] text-white/60 mb-[6px] uppercase">
                Shot on location
              </div>
              <div className="text-[19px] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                {active.place}
              </div>
              <div className="text-[13.5px] font-medium text-white/70 mt-[2px]">{active.sub}</div>
            </div>

            {/* Hover: Location Caption Only (Now Title 1,2,3 Centered) */}
            <div style={hoverInfoStyle}>
              <h2 className="m-0 text-[34px] leading-[1.04] font-[800] tracking-[-0.03em] text-white text-balance">
                {active.title1}
                <br />
                {active.title2}
                <br />
                <span className="italic font-medium" style={{ color: accent }}>
                  {active.title3}
                </span>
              </h2>
            </div>
          </div>
        </div>
      )}

      {mode === "gallery" && (
        <div style={stageStyle} className="relative z-10 w-full max-w-sm flex items-center justify-center mx-auto text-left">
          <div className="flex flex-col items-center gap-[26px]">
            <div className="relative w-[340px] h-[456px]">
              {PHOTOS.map((ph, j) => {
                const p = ((j - activeIndex) % n + n) % n;
                const f = fan[Math.min(p, fan.length - 1)];
                const isTop = p === 0;
                
                let tx = f.x;
                let r = f.r;
                let op = 1;
                
                if (isTop && dragging) {
                  tx = f.x + dragX;
                  r = dragX * 0.04;
                  op = Math.max(0, 1 - Math.abs(dragX) / 340);
                }
                
                const hidden = p >= 3 && !(isTop && dragging);
                
                const style: React.CSSProperties = {
                  position: "absolute",
                  inset: "0",
                  transform: `translate(${tx}px,${f.y}px) rotate(${r}deg) scale(${f.s})`,
                  transformOrigin: "center 60%",
                  zIndex: String(n - p),
                  opacity: hidden ? 0 : op,
                  transition: dragging && isTop ? "none" : "transform .5s cubic-bezier(.22,1,.36,1),opacity .35s",
                  cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
                  borderRadius: "26px",
                  overflow: "hidden",
                  boxShadow: "0 30px 60px -22px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.05)",
                  touchAction: "none",
                  userSelect: "none",
                };
                
                const showCaption = isTop && (deckHover || noHover) && !dragging;
                
                const gStyle: React.CSSProperties = {
                  position: "absolute",
                  inset: "0",
                  pointerEvents: "none",
                  background: "linear-gradient(to top, rgba(6,6,8,.9) 2%, rgba(6,6,8,.4) 30%, rgba(6,6,8,0) 55%)",
                  opacity: showCaption ? 1 : 0,
                  transition: "opacity .3s",
                };
                
                const overlayStyle: React.CSSProperties = {
                  position: "absolute",
                  left: "22px",
                  right: "22px",
                  bottom: "22px",
                  pointerEvents: "none",
                  opacity: showCaption ? 1 : 0,
                  transform: showCaption ? "none" : "translateY(10px)",
                  transition: "opacity .3s, transform .35s cubic-bezier(.22,1,.36,1)",
                };

                return (
                  <div
                    key={ph.id}
                    onPointerDown={(e) => onDown(e, ph.id)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onMouseEnter={() => {
                      setDeckHover(true);
                      resetIdle();
                    }}
                    onMouseLeave={() => setDeckHover(false)}
                    style={style}
                  >
                    <Image
                      src={ph.src}
                      alt={ph.place}
                      fill
                      sizes="340px"
                      className="object-cover pointer-events-none"
                    />
                    <div style={gStyle}></div>
                    <div style={overlayStyle}>
                      <div className="text-[10.5px] font-bold tracking-[0.18em] text-white/60 mb-[6px] uppercase">
                        Shot on location
                      </div>
                      <div className="text-[21px] font-[700] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                        {ph.place}
                      </div>
                      <div className="text-[14px] font-medium text-white/75 mt-[2px]">{ph.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-[16px]">
              <div className="flex gap-[7px]">
                {PHOTOS.map((_, j) => (
                  <span
                    key={j}
                    className="inline-block transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      width: j === activeIndex ? "22px" : "7px",
                      height: "7px",
                      borderRadius: "999px",
                      background: j === activeIndex ? accent : "rgba(255,255,255,.2)",
                    }}
                  ></span>
                ))}
              </div>
            </div>
            
            <div className="text-[12.5px] text-[#55555c] font-medium">
              {noHover
                ? "Swipe left / right to browse photos"
                : "Hold & drag left / right to browse · hover for location"}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
