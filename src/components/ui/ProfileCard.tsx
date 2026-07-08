"use client";

import { useState, useRef, useEffect } from "react";

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
    title1: "Chasing",
    title2: "light across",
    title3: "the world.",
    src: "./assets/image/profile_image/excel.webp", // User will replace
  },
  {
    id: "photo-1",
    place: "WICE 2026",
    sub: "President University · April 2026",
    title1: "WICE",
    title2: "Silver",
    title3: "Medalist.",
    src: "./assets/image/profile_image/wice.jpg", // User will replace
  },
  {
    id: "photo-2",
    place: "Gunung Gede",
    sub: "Cianjur, Indonesia · March 2026",
    title1: "Conquering",
    title2: "peaks and",
    title3: "dreams.",
    src: "./assets/image/profile_image/gede.jpg", // User will replace
  },
  {
    id: "photo-3",
    place: "Borobudur",
    sub: "Magelang, Indonesia · March 2026",
    title1: "Sunrise over",
    title2: "ancient",
    title3: "stupa.",
    src: "./assets/image/profile_image/borobudur.jpg", // User will replace
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
  
  const startXRef = useRef(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimer1Ref = useRef<NodeJS.Timeout | null>(null);
  const fadeTimer2Ref = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (fadeTimer1Ref.current) clearTimeout(fadeTimer1Ref.current);
      if (fadeTimer2Ref.current) clearTimeout(fadeTimer2Ref.current);
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
    resetIdle();
    setDragX(e.clientX - startXRef.current);
  };

  const onUp = () => {
    if (!dragging) return;
    const n = PHOTOS.length;
    let i = activeIndex;
    if (dragX <= -110) i = (i + 1) % n;
    else if (dragX >= 110) i = (i - 1 + n) % n;
    
    resetIdle();
    setDragging(false);
    setDragX(0);
    setActiveIndex(i);
  };

  const n = PHOTOS.length;
  const active = PHOTOS[activeIndex] || PHOTOS[0];

  const stageStyle: React.CSSProperties = {
    opacity: stageIn ? 1 : 0,
    transform: stageIn ? "scale(1)" : "scale(0.93)",
    filter: stageIn ? "blur(0px)" : "blur(6px)",
    transition: "opacity .3s ease, transform .42s cubic-bezier(.22,1,.36,1), filter .3s ease",
    willChange: "opacity, transform",
  };

  // Card view styles
  const imageWrapStyle: React.CSSProperties = {
    position: "absolute",
    top: "14px",
    left: "14px",
    right: "14px",
    bottom: cardHover ? "14px" : "104px",
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
    opacity: cardHover ? 1 : 0,
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
    opacity: cardHover ? 0 : 1,
    transform: cardHover ? "translateY(12px)" : "none",
    transition: "opacity .3s, transform .5s cubic-bezier(.22,1,.36,1)",
    pointerEvents: cardHover ? "none" : "auto",
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
    opacity: cardHover ? 1 : 0,
    transform: cardHover ? "none" : "translateY(14px)",
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
      }}
    >
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: 340,
          height: 500,
        }}
        className="absolute top-0 left-0 flex items-center justify-center"
      >
      {mode === "card" && (
        <div style={stageStyle} className="relative z-10 w-full max-w-sm flex items-center justify-center mx-auto text-left">
          <div
            onMouseEnter={() => setCardHover(true)}
            onMouseLeave={() => setCardHover(false)}
            onClick={enterGallery}
            className="relative w-[340px] h-[500px] bg-[#141416] rounded-[30px] overflow-hidden cursor-pointer shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
          >
            <div style={imageWrapStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.src} alt={active.place} className="w-full h-full object-cover" />
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
                
                const showCaption = isTop && deckHover && !dragging;
                
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.src} alt={ph.place} className="w-full h-full object-cover pointer-events-none" />
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
              Hold & drag left / right to browse · hover for location
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
