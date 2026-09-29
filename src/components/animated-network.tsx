import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Fond animé: réseau de nœuds connectés évoquant la centralisation
 * du back-office vers les deux plateformes DISTRICAP.
 */
export function AnimatedNetwork({ className = "", density = 42 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let nodes: Node[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
      }));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) {
            ctx.strokeStyle = `rgba(103, 208, 235, ${(1 - d / 140) * 0.22})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = "rgba(125, 220, 245, 0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // flux de données circulant horizontalement
      for (let k = 0; k < 3; k++) {
        const t = ((frame * 0.0022 + k / 3) % 1) * width;
        const y = height * (0.3 + k * 0.2);
        const grad = ctx.createLinearGradient(t - 90, y, t, y);
        grad.addColorStop(0, "rgba(103, 208, 235, 0)");
        grad.addColorStop(1, "rgba(103, 208, 235, 0.5)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(t - 90, y);
        ctx.lineTo(t, y);
        ctx.stroke();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    let raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

/** Schéma animé: back-office central pilotant les deux plateformes. */
export function EcosystemDiagram() {
  return (
    <div className="relative w-full max-w-md select-none">
      <div className="mx-auto w-fit rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-center backdrop-blur-sm">
        <p className="font-display text-sm font-semibold tracking-wide text-primary-foreground">
          BACK-OFFICE DISTRICAP
        </p>
        <p className="text-[11px] text-primary-foreground/60">Pilotage centralisé</p>
      </div>

      <svg viewBox="0 0 320 70" className="mx-auto h-16 w-full" aria-hidden>
        <defs>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(103,208,235,0.15)" />
            <stop offset="50%" stopColor="rgba(103,208,235,0.9)" />
            <stop offset="100%" stopColor="rgba(103,208,235,0.15)" />
          </linearGradient>
        </defs>
        <path d="M160 2 L160 24 L70 24 L70 64" fill="none" stroke="rgba(103,208,235,0.28)" strokeWidth="1.5" />
        <path d="M160 2 L160 24 L250 24 L250 64" fill="none" stroke="rgba(103,208,235,0.28)" strokeWidth="1.5" />
        <circle r="3" fill="url(#flow)">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M160 2 L160 24 L70 24 L70 64" />
        </circle>
        <circle r="3" fill="url(#flow)">
          <animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path="M160 2 L160 24 L250 24 L250 64" />
        </circle>
      </svg>

      <div className="grid grid-cols-2 gap-4">
        {["SITE E-COMMERCE", "SITE VITRINE"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-3 text-center backdrop-blur-sm"
          >
            <p className="font-display text-xs font-semibold tracking-wide text-primary-foreground/90">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
