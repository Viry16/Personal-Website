"use client";

import { useEffect, useRef, memo, useId } from 'react';

const TWO_PI = Math.PI * 2;

interface Dot {
  ax: number; ay: number; sx: number; sy: number;
  vx: number; vy: number; x: number; y: number;
  big: boolean; px: number; py: number;
}

interface DotFieldProps {
  dotRadius?: number; dotSpacing?: number; cursorRadius?: number;
  cursorForce?: number; bulgeOnly?: boolean; bulgeStrength?: number;
  glowRadius?: number; sparkle?: boolean; waveAmplitude?: number;
  gradientFrom?: string; gradientTo?: string; glowColor?: string; 
  accentColor?: string;
  [key: string]: unknown;
}

function useDotFieldCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  glowRef: React.RefObject<SVGCircleElement | null>,
  props: DotFieldProps
) {
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const glowOpacity = useRef(0);
  const engagement = useRef(0);
  
  // Keep the latest props available to the animation loop without writing to
  // a ref during render (which React flags). The loop reads propsRef.current
  // each frame; syncing in an effect is fine — a one-frame lag is invisible.
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const rebuildRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer: ReturnType<typeof setTimeout>;
    let frameCount = 0;

    function buildDots(w: number, h: number) {
      const p = propsRef.current;
      const step = (p.dotRadius as number) + (p.dotSpacing as number);
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      
      const dots: Dot[] = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          const big = Math.random() < 0.05;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay, big, px: ax, py: ay };
        }
      }
      dotsRef.current = dots;
    }

    function doResize() {
      if (!canvas) return;
      const rect = canvas.parentElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, offsetX: rect.left + window.scrollX, offsetY: rect.top + window.scrollY };
      buildDots(w, h);
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }

    function updateMouseSpeed() {
      const m = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    function drawDots(t: number, w: number, h: number, p: DotFieldProps, m: typeof mouseRef.current, eng: number) {
      const dots = dotsRef.current;
      const len = dots.length;
      
      const grad = ctx!.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom as string);
      grad.addColorStop(1, p.gradientTo as string);
      ctx!.fillStyle = grad;
      
      const cr = p.cursorRadius as number;
      const crSq = cr * cr;
      const rad = (p.dotRadius as number) / 2;
      const isBulge = p.bulgeOnly as boolean;
      
      ctx!.beginPath();
      
      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          const angle = Math.atan2(dy, dx);
          
          if (isBulge) {
            const ratio = 1 - dist / cr;
            const push = ratio * ratio * (p.bulgeStrength as number) * eng;
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const move = (500 / dist) * (m.speed * (p.cursorForce as number));
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        
        if ((p.waveAmplitude as number) > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * (p.waveAmplitude as number);
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * (p.waveAmplitude as number) * 0.5;
        }

        d.px = drawX;
        d.py = drawY;

        let r = d.big ? rad * 2.4 : rad;
        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if ((hash % 100) < 3) r = Math.max(r, rad * 1.8);
        }
        
        ctx!.moveTo(drawX + r, drawY);
        ctx!.arc(drawX, drawY, r, 0, TWO_PI);
      }
      
      ctx!.fill();
    }

    function drawAccentDots(t: number, p: DotFieldProps) {
      const accent = p.accentColor as string | undefined;
      if (!accent) return;
      
      const dots = dotsRef.current;
      const rad = (p.dotRadius as number) / 2;
      
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (!d.big) continue;
        
        const pulse = (Math.sin(t * 1.2 + d.ax * 0.02 + d.ay * 0.02) + 1) / 2;
        const coreRad = rad * (1.0 + pulse * 0.3);
        
        ctx!.beginPath();
        ctx!.moveTo(d.px + coreRad, d.py);
        ctx!.arc(d.px, d.py, coreRad, 0, TWO_PI);
        ctx!.globalAlpha = 0.5 + pulse * 0.3;
        ctx!.fillStyle = accent;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1.0;
    }

    function updateCursorGlow(m: typeof mouseRef.current, eng: number) {
      glowOpacity.current += (eng - glowOpacity.current) * 0.08;
      
      if (glowEl) {
        glowEl.setAttribute('cx', String(m.x));
        glowEl.setAttribute('cy', String(m.y));
        glowEl.style.opacity = String(glowOpacity.current);
      }
    }

    function tick() {
      frameCount++;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const m = mouseRef.current;
      const t = frameCount * 0.02;

      const targetEngagement = Math.min(m.speed / 5, 1);
      engagement.current += (targetEngagement - engagement.current) * 0.06;
      if (engagement.current < 0.001) engagement.current = 0;
      
      ctx!.clearRect(0, 0, w, h);
      
      updateCursorGlow(m, engagement.current);
      drawDots(t, w, h, p, m, engagement.current);
      drawAccentDots(t, p);
      
      rafRef.current = requestAnimationFrame(tick);
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);
    const resizeObserver = new ResizeObserver(resize);
    
    doResize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    
    rafRef.current = requestAnimationFrame(tick);

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) buildDots(w, h);
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [canvasRef, glowRef]);

  useEffect(() => {
    rebuildRef.current?.();
  }, [props.dotRadius, props.dotSpacing]);
}

const DotField = memo(({
  dotRadius = 1.5, dotSpacing = 14, cursorRadius = 500,
  cursorForce = 0.1, bulgeOnly = true, bulgeStrength = 67,
  glowRadius = 100, sparkle = false, waveAmplitude = 0,
  gradientFrom = 'rgba(255, 255, 255, 1)', gradientTo = 'hsla(0, 0%, 97%, 0.25)',
  glowColor = '#000000ff', accentColor = 'rgba(255, 255, 255, 0.9)', ...rest
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const id = useId();
  const glowId = `dot-field-glow-${id.replace(/:/g, '')}`;

  const props = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, glowRadius, sparkle, waveAmplitude, gradientFrom, gradientTo, glowColor, accentColor };
  useDotFieldCanvas(canvasRef, glowRef, props);

  return (
    <div className="w-full h-full relative" {...rest}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <svg ref={svgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle ref={glowRef} cx="-9999" cy="-9999" r={glowRadius} fill={`url(#${glowId})`} style={{ opacity: 0, willChange: 'opacity' }} />
      </svg>
    </div>
  );
});

DotField.displayName = 'DotField';
export default DotField;
