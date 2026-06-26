import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Zap, ShieldCheck, HeartPulse, Layout, HelpCircle, Sparkles, MessageSquare, Box, Play, Menu, X, Globe, Video, Calendar, Instagram, Youtube, Linkedin, PhoneCall } from "lucide-react";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vslPlaying, setVslPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const vslFrameRef = useRef<HTMLDivElement | null>(null);

  // Stats ref for animated counters
  const statsRowRef = useRef<HTMLDivElement | null>(null);
  const metricsGridRef = useRef<HTMLDivElement | null>(null);

  // States for cursor position (Lerp simulation in state/effects)
  const [mousePos, setMousePos] = useState({ x: -400, y: -400 });
  const [ringPos, setRingPos] = useState({ x: -400, y: -400 });
  const [glowPos, setGlowPos] = useState({ x: -400, y: -400 });
  const [isHovered, setIsHovered] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Smooth cursor lerp loop
  useEffect(() => {
    let animationFrameId: number;

    const updateLerpCursor = () => {
      setRingPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.14,
          y: prev.y + dy * 0.14,
        };
      });

      setGlowPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.07,
          y: prev.y + dy * 0.07,
        };
      });

      animationFrameId = requestAnimationFrame(updateLerpCursor);
    };

    animationFrameId = requestAnimationFrame(updateLerpCursor);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeaveDoc = () => setCursorVisible(false);
    const handleMouseEnterDoc = () => setCursorVisible(true);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeaveDoc);
    document.addEventListener("mouseenter", handleMouseEnterDoc);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveDoc);
      document.removeEventListener("mouseenter", handleMouseEnterDoc);
    };
  }, []);

  // Set up hover states on interactive elements
  useEffect(() => {
    const interactiveSelectors = 'a, button, .pilar-card, .auth-card, .metric-card, .vsl-play-btn, .btn-nav, .btn-primary';
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const updateListeners = () => {
      const elements = document.querySelectorAll(interactiveSelectors);
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    };

    updateListeners();

    // Re-run listener attachment if DOM updates
    const observer = new MutationObserver(updateListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const elements = document.querySelectorAll(interactiveSelectors);
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // ── CANVASS PARTICLES ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const COLORS = ["rgba(245,166,35,", "rgba(59,130,246,", "rgba(139,92,246,"];

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      r = 0;
      alpha = 0;
      color = "";
      life = 0;
      maxLife = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = (Math.random() - 0.5) * 0.22;
        this.r = Math.random() * 1.6 + 0.3;
        this.alpha = Math.random() * 0.35 + 0.08;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life = 0;
        this.maxLife = Math.random() * 350 + 180;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
          this.reset();
        }

        // Gentle attraction to the mouse position
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          this.vx += (dx / dist) * 0.014;
          this.vy += (dy / dist) * 0.014;
        }
        this.vx *= 0.992;
        this.vy *= 0.992;
      }

      draw() {
        if (!ctx) return;
        const progress = this.life / this.maxLife;
        const a = this.alpha * (1 - Math.pow(progress * 2 - 1, 2));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + a + ")";
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 110; i++) {
      particles.push(new Particle());
    }

    const drawLines = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245,166,35,${0.035 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    let animationId: number;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [mousePos]);

  // ── NAVBAR SCROLL & ACTIVE SECTIONS ──
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section spy
      const sections = ["hero", "autoridad", "pilares", "resultados", "agenda"];
      const scrollY = window.scrollY + 160;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── SCROLL ANIMATIONS / INTERSECTION OBSERVER ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".metric-card, .auth-card, .pilar-card");
    elements.forEach((el, index) => {
      (el as HTMLElement).style.transitionDelay = `${index * 0.08}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ── COUNTER ANIMATIONS ──
  useEffect(() => {
    const countersAnimated = new Set();

    const animateCounter = (el: HTMLElement) => {
      if (countersAnimated.has(el)) return;
      countersAnimated.add(el);

      const target = parseInt(el.dataset.target || "0", 10);
      const duration = 2200;
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = Math.min(now - start, duration);
        const progress = elapsed / duration;
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(ease * target);

        el.textContent =
          target >= 1000000
            ? (value / 1000000).toFixed(1) + "M"
            : value.toLocaleString("es-AR");

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent =
            target >= 1000000
              ? (target / 1000000).toFixed(1) + "M"
              : target.toLocaleString("es-AR");
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll("[data-target]").forEach((counterEl) => {
            animateCounter(counterEl as HTMLElement);
          });
        });
      },
      { threshold: 0.2 }
    );

    if (statsRowRef.current) counterObserver.observe(statsRowRef.current);
    if (metricsGridRef.current) counterObserver.observe(metricsGridRef.current);

    return () => counterObserver.disconnect();
  }, []);

  // ── MAGNETIC BUTTON EFFECTS ──
  useEffect(() => {
    const buttons = document.querySelectorAll(".btn-primary, .btn-nav");

    const handleMouseMove = (e: MouseEvent, btn: HTMLElement) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * 0.28;
      const dy = (e.clientY - rect.top - rect.height / 2) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const handleMouseLeave = (btn: HTMLElement) => {
      btn.style.transform = "";
    };

    buttons.forEach((el) => {
      const btn = el as HTMLElement;
      const onMove = (e: MouseEvent) => handleMouseMove(e, btn);
      const onLeave = () => handleMouseLeave(btn);

      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);

      (btn as any)._cleanup = () => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      buttons.forEach((el) => {
        const btn = el as any;
        if (btn._cleanup) btn._cleanup();
      });
    };
  }, []);

  // ── TILT EFFECT ON CARDS ──
  useEffect(() => {
    const cards = document.querySelectorAll(".pilar-card, .auth-card");

    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      card.style.transition = "none";
    };

    const handleMouseLeave = (card: HTMLElement) => {
      card.style.transform = "";
      card.style.transition = "";
    };

    cards.forEach((el) => {
      const card = el as HTMLElement;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      const onLeave = () => handleMouseLeave(card);

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);

      (card as any)._cleanup = () => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      cards.forEach((el) => {
        const card = el as any;
        if (card._cleanup) card._cleanup();
      });
    };
  }, []);

  // ── VSL PARALLAX TILT ──
  useEffect(() => {
    const frame = vslFrameRef.current;
    if (!frame) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = frame.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      frame.style.transform = `perspective(900px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    };

    const handleMouseLeave = () => {
      frame.style.transform = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // ── VSL VIDEO PLAY/PAUSE CONTROLLER ──
  const handleVslPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!vslPlaying) {
      video.muted = false;
      video.play().then(() => setVslPlaying(true)).catch(() => setVslPlaying(true));
    } else {
      video.pause();
      setVslPlaying(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => setVslPlaying(false);
    const handlePlay = () => setVslPlaying(true);

    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
    };
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#060608] text-[#E8E8F0]">
      
      {/* Custom Cursor elements */}
      {cursorVisible && (
        <>
          <div
            id="cursor-dot"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
          />
          <div
            id="cursor-ring"
            className={isHovered ? "hover" : ""}
            style={{
              left: `${ringPos.x}px`,
              top: `${ringPos.y}px`,
            }}
          />
          <div
            id="cursor-glow"
            style={{
              left: `${glowPos.x}px`,
              top: `${glowPos.y}px`,
            }}
          />
        </>
      )}

      {/* Canvas background for ambient particles */}
      <canvas id="particles-canvas" ref={canvasRef} />

      {/* Navbar section */}
      <nav id="navbar" className={scrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <a
            href="#hero"
            onClick={(e) => handleSmoothScroll(e, "hero")}
            className="logo"
            id="nav-logo"
          >
            TheFinal<span>Page</span>
          </a>
          
          <ul className={`nav-links ${menuOpen ? "flex" : ""}`} id="nav-links">
            <li>
              <a
                href="#hero"
                onClick={(e) => handleSmoothScroll(e, "hero")}
                className={`nav-link ${activeSection === "hero" ? "active" : ""}`}
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="#autoridad"
                onClick={(e) => handleSmoothScroll(e, "autoridad")}
                className={`nav-link ${activeSection === "autoridad" ? "active" : ""}`}
              >
                Autoridad
              </a>
            </li>
            <li>
              <a
                href="#pilares"
                onClick={(e) => handleSmoothScroll(e, "pilares")}
                className={`nav-link ${activeSection === "pilares" ? "active" : ""}`}
              >
                Metodología
              </a>
            </li>
            <li>
              <a
                href="#resultados"
                onClick={(e) => handleSmoothScroll(e, "resultados")}
                className={`nav-link ${activeSection === "resultados" ? "active" : ""}`}
              >
                Resultados
              </a>
            </li>
          </ul>

          <a
            href="#agenda"
            onClick={(e) => handleSmoothScroll(e, "agenda")}
            className="btn-nav"
            id="btn-cta-nav"
          >
            Agendar Sesión
          </a>

          <button
            className="hamburger"
            id="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-[#E8E8F0]" />
            ) : (
              <Menu className="w-6 h-6 text-[#E8E8F0]" />
            )}
          </button>
        </div>
        
        {/* Mobile menu responsive overlay container */}
        {menuOpen && (
          <div className="md:hidden absolute top-[64px] left-0 right-0 p-5 bg-[#060608]/98 border-b border-white/5 flex flex-col gap-4 z-[999] backdrop-blur-xl">
            <a
              href="#hero"
              onClick={(e) => handleSmoothScroll(e, "hero")}
              className={`text-base font-medium py-2 px-4 rounded-full transition-colors ${
                activeSection === "hero" ? "text-white bg-white/10" : "text-[#7A7A9A]"
              }`}
            >
              Inicio
            </a>
            <a
              href="#autoridad"
              onClick={(e) => handleSmoothScroll(e, "autoridad")}
              className={`text-base font-medium py-2 px-4 rounded-full transition-colors ${
                activeSection === "autoridad" ? "text-white bg-white/10" : "text-[#7A7A9A]"
              }`}
            >
              Autoridad
            </a>
            <a
              href="#pilares"
              onClick={(e) => handleSmoothScroll(e, "pilares")}
              className={`text-base font-medium py-2 px-4 rounded-full transition-colors ${
                activeSection === "pilares" ? "text-white bg-white/10" : "text-[#7A7A9A]"
              }`}
            >
              Metodología
            </a>
            <a
              href="#resultados"
              onClick={(e) => handleSmoothScroll(e, "resultados")}
              className={`text-base font-medium py-2 px-4 rounded-full transition-colors ${
                activeSection === "resultados" ? "text-white bg-white/10" : "text-[#7A7A9A]"
              }`}
            >
              Resultados
            </a>
            <a
              href="#agenda"
              onClick={(e) => handleSmoothScroll(e, "agenda")}
              className="mt-2 text-center py-3 rounded-full font-bold bg-[#F5A623] text-black shadow-[0_0_24px_rgba(245,166,35,0.4)]"
            >
              Agendar Sesión de Consultoría
            </a>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════
           HERO SECTION
      ═══════════════════════════════════ */}
      <section id="hero" className="relative z-[2]">
        <div className="hero-bg-grid" />
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />

        <div className="hero-inner">
          {/* Copy section */}
          <div className="hero-copy" id="hero-copy">
            <div className="hero-badge" id="hero-badge">
              <span className="badge-dot" />
              La pieza final de tu embudo de ventas
            </div>

            <h1 className="hero-title" id="hero-title">
              <span className="line-wrapper">
                <span className="line line-1">EL CIERRE</span>
              </span>
              <span className="line-wrapper">
                <span className="line line-2">PERFECTO</span>
              </span>
              <span className="line-wrapper gold-wrap">
                <span className="line line-3 font-extrabold">DE TU EMBUDO</span>
              </span>
            </h1>

            <p className="hero-sub text-[#7A7A9A]" id="hero-sub">
              Diseñamos landings <strong>ultra especializadas</strong> que retienen al visitante,
              comunican tu oferta con precisión quirúrgica y se convierten en el cierre
              definitivo de cualquier embudo de ventas digital.
            </p>

            <div className="hero-ctas" id="hero-ctas">
              <a
                href="#agenda"
                onClick={(e) => handleSmoothScroll(e, "agenda")}
                className="btn-primary"
                id="btn-primary"
              >
                <span>Cierra tu Embudo con Nosotros</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#autoridad"
                onClick={(e) => handleSmoothScroll(e, "autoridad")}
                className="btn-ghost"
                id="btn-ghost"
              >
                Ver nuestra especialización
              </a>
            </div>

            {/* Stats list with count animations */}
            <div className="stats-row" id="stats-row" ref={statsRowRef}>
              <div className="stat-card" id="stat-1">
                <span className="stat-num" data-target="312">
                  0
                </span>
                <span className="stat-suffix">%</span>
                <p>Aumento de retención</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-card" id="stat-2">
                <span className="stat-num" data-target="7">
                  0
                </span>
                <span className="stat-suffix">x</span>
                <p>Más conversiones</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-card" id="stat-3">
                <span className="stat-num" data-target="100">
                  0
                </span>
                <span className="stat-suffix">%</span>
                <p>Enfoque en ventas</p>
              </div>
            </div>
          </div>

          {/* VSL Video segment */}
          <div className="hero-video-wrap" id="hero-video-wrap">
            <div className="vsl-frame" id="vsl-frame" ref={vslFrameRef}>
              <div className="vsl-glow-ring" />
              <div className="vsl-screen relative">
                <video
                  id="vsl-video"
                  ref={videoRef}
                  preload="none"
                  playsInline
                  loop
                  muted
                  className="w-full h-full object-cover"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                </video>

                {/* Cover overlay when not playing */}
                {!vslPlaying && (
                  <div className="vsl-overlay absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85">
                    <div className="vsl-top-bar">
                      <span className="vsl-live-dot" />
                      <span>VIDEO DE PRESENTACIÓN</span>
                    </div>

                    <button
                      className="vsl-play-btn"
                      onClick={handleVslPlay}
                      aria-label="Reproducir video"
                    >
                      <div className="play-ring play-ring-1" />
                      <div className="play-ring play-ring-2" />
                      <div className="play-ring play-ring-3" />
                      <Play className="w-7 h-7 text-black fill-black ml-1" />
                    </button>

                    <p className="vsl-hint">▶ Mirá cómo construimos el cierre perfecto de tu embudo</p>
                  </div>
                )}
              </div>
              <div className="vsl-label mt-4">
                <span className="vsl-label-dot" /> VSL — Video Sales Letter
              </div>
            </div>

            <div className="float-badge fb-1" id="fb-1">
              <Zap className="w-4 h-4 text-[#F5A623]" />
              Alta Conversión
            </div>
            <div className="float-badge fb-2" id="fb-2">
              <Calendar className="w-4 h-4 text-[#F5A623]" />
              Entrega en 7 días
            </div>
          </div>
        </div>

        <div className="scroll-hint" id="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ═══════════════════════════════════
           LOGOS STRIP SECTION
      ═══════════════════════════════════ */}
      <section id="logos-strip" className="relative z-[2]">
        <p className="logos-label">Negocios digitales que ya tienen el cierre perfecto en su embudo</p>
        <div className="logos-track">
          <div className="logos-inner" id="logos-inner">
            <span>InfoNegocios</span>
            <span>DigitalPro</span>
            <span>EcomBoost</span>
            <span>CoachVentas</span>
            <span>AcademiaX</span>
            <span>MarketGenius</span>
            <span>FunnelMax</span>
            <span>SalesHub</span>
            <span>ProDigital</span>
            {/* Duplicate for infinite loop */}
            <span>InfoNegocios</span>
            <span>DigitalPro</span>
            <span>EcomBoost</span>
            <span>CoachVentas</span>
            <span>AcademiaX</span>
            <span>MarketGenius</span>
            <span>FunnelMax</span>
            <span>SalesHub</span>
            <span>ProDigital</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           AUTORIDAD SECTION
      ═══════════════════════════════════ */}
      <section id="autoridad" className="relative z-[2] px-4">
        <div className="hero-orb orb-a1" />
        <div className="section-inner">
          <div className="section-tag">Nuestra Especialización</div>
          <h2 className="section-title">
            Una landing no es una web.
            <br />
            <span className="gold-text">Es tu mejor vendedor.</span>
          </h2>
          <p className="section-sub text-[#7A7A9A]">
            Nos especializamos en diseñar la pieza más crítica de cualquier negocio digital:
            la landing que retiene al visitante, comunica la oferta con precisión y
            cierra la venta. Sin distracciones, sin fricción, con intención pura.
          </p>

          <div className="authority-grid" id="authority-grid">
            {/* Authority Card 1 */}
            <div className="auth-card" id="ac-1">
              <div className="auth-num">01</div>
              <div className="auth-icon">
                <Zap className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Retención desde el Primer Segundo</h3>
              <p className="text-[#7A7A9A] text-sm leading-relaxed">
                Una landing que pierde al visitante en los primeros 5 segundos no sirve de nada. Diseñamos cada elemento para <strong>enganchar, retener y guiar</strong> sin que el usuario sienta que quiere irse.
              </p>
            </div>

            {/* Authority Card 2 */}
            <div className="auth-card" id="ac-2">
              <div className="auth-num">02</div>
              <div className="auth-icon">
                <MessageSquare className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tu Oferta Comunicada con Precisión</h3>
              <p className="text-[#7A7A9A] text-sm leading-relaxed">
                Traducimos lo que tu negocio quiere transmitir en un mensaje claro, directo y persuasivo. Sin ambigüedades. Sin ruido. <strong>Solo lo que el comprador necesita escuchar para decir sí.</strong>
              </p>
            </div>

            {/* Authority Card 3 */}
            <div className="auth-card" id="ac-3">
              <div className="auth-num">03</div>
              <div className="auth-icon">
                <Layout className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold mb-3">La Última Pieza del Embudo</h3>
              <p className="text-[#7A7A9A] text-sm leading-relaxed">
                Tu tráfico, tus anuncios y tu contenido hacen su trabajo. Nuestra landing hace el cierre. Diseñada para ser <strong>el punto final que convierte la intención en dinero</strong> en tu cuenta.
              </p>
            </div>

            {/* Authority Card 4 */}
            <div className="auth-card" id="ac-4">
              <div className="auth-num">04</div>
              <div className="auth-icon">
                <ShieldCheck className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ultra Profesional, Sin Compromisos</h3>
              <p className="text-[#7A7A9A] text-sm leading-relaxed">
                Cada landing que construimos es tratada como una pieza de ingeniería de ventas: diseño premium, copy de alto impacto y estructura probada que <strong>no deja nada al azar</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           PILARES SECTION
      ═══════════════════════════════════ */}
      <section id="pilares" className="relative z-[2] px-4">
        <div className="section-inner">
          <div className="section-tag">Metodología TheFinalPage</div>
          <h2 className="section-title">
            Cómo construimos <span class="gold-text">el cierre</span>
            <br />
            que tu embudo necesita
          </h2>
          <p className="section-sub text-[#7A7A9A]">
            Una landing de ventas ultra profesional no se improvisa. Tiene una arquitectura
            interna precisa que retiene, persuade y convierte. Estos son los 4 pilares que
            implementamos en cada pieza que creamos.
          </p>

          <div className="pilares-grid" id="pilares-grid">
            {/* Pilar 1 */}
            <div className="pilar-card featured-pilar" id="pc-1">
              <div className="pc-glow" />
              <div className="pilar-tag">PILAR 01</div>
              <div className="pilar-icon">
                <Sparkles className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Retención Total del Visitante</h3>
              <p className="text-sm text-[#7A7A9A] leading-relaxed mb-4">
                Construimos un entorno visual y narrativo del que es casi imposible escapar. Cada sección está diseñada para que el visitante sienta que <strong>necesita seguir leyendo</strong> antes de tomar una decisión.
              </p>
              <div className="pilar-tags">
                <span>Scroll Depth</span>
                <span>Hook Visual</span>
                <span>Flujo narrativo</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="pilar-card" id="pc-2">
              <div className="pc-glow" />
              <div className="pilar-tag">PILAR 02</div>
              <div className="pilar-icon">
                <HelpCircle className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Comunicación que Vende, No que Informa</h3>
              <p className="text-sm text-[#7A7A9A] leading-relaxed mb-4">
                Transformamos lo que querés decir en lo que tu cliente necesita escuchar. Copy que habla directamente al deseo, al dolor y a la decisión. <strong>Sin ruido. Solo intención de compra.</strong>
              </p>
              <div className="pilar-tags">
                <span>PAS / AIDA</span>
                <span>Voice of Customer</span>
                <span>Objeciones</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="pilar-card" id="pc-3">
              <div className="pc-glow" />
              <div className="pilar-tag">PILAR 03</div>
              <div className="pilar-icon">
                <Layout className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Diseño que Decide por el Usuario</h3>
              <p className="text-sm text-[#7A7A9A] leading-relaxed mb-4">
                El visitante no debería pensar. El diseño lo guía. Jerarquía visual estratégica, flujo de lectura calculado y CTAs irresistibles que hacen que la decisión de compra <strong>se sienta natural e inevitable</strong>.
              </p>
              <div className="pilar-tags">
                <span>Visual Flow</span>
                <span>CTA Strategy</span>
                <span>Friction-less UX</span>
              </div>
            </div>

            {/* Pilar 4 */}
            <div className="pilar-card" id="pc-4">
              <div className="pc-glow" />
              <div className="pilar-tag">PILAR 04</div>
              <div className="pilar-icon">
                <Box className="w-6 h-6 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-bold mb-2">El Cierre Perfecto del Embudo</h3>
              <p className="text-sm text-[#7A7A9A] leading-relaxed mb-4">
                Cada landing está construida para encajar exactamente al final de tu embudo. Recibe el tráfico caliente, elimina las últimas objeciones y <strong>convierte la intención en venta</strong> con precisión quirúrgica.
              </p>
              <div className="pilar-tags">
                <span>Funnel End</span>
                <span>Conversión</span>
                <span>VSL Strategy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           RESULTADOS SECTION
      ═══════════════════════════════════ */}
      <section id="resultados" className="relative z-[2] px-4">
        <div className="hero-orb orb-r1" />
        <div className="section-inner">
          <div className="section-tag">Qué generamos</div>
          <h2 className="section-title">
            Lo que sucede cuando el
            <br />
            <span className="gold-text">cierre es perfecto</span>
          </h2>
          <p className="section-sub text-[#7A7A9A]">
            Una landing ultra especializada no es un gasto, es la inversión con mayor retorno
            dentro de cualquier embudo de ventas digital. Esto es lo que le pasa a tu negocio.
          </p>

          <div className="metrics-grid" id="metrics-grid" ref={metricsGridRef}>
            {/* Metric 1 */}
            <div className="metric-card" id="mc-1">
              <div className="metric-icon">🧲</div>
              <div className="metric-val">
                <span className="count" data-target="312">
                  0
                </span>
                %
              </div>
              <div className="metric-label">Más retención de visitantes vs. una landing genérica</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ "--w": "78%" } as React.CSSProperties} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="metric-card featured" id="mc-2">
              <div className="metric-icon">🎯</div>
              <div className="metric-val">
                <span className="count" data-target="7">
                  0
                </span>
                x
              </div>
              <div className="metric-label">Multiplicás la tasa de conversión de tu embudo actual</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ "--w": "92%" } as React.CSSProperties} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="metric-card" id="mc-3">
              <div className="metric-icon">⚡</div>
              <div className="metric-val">
                <span className="count" data-target="100">
                  0
                </span>
                %
              </div>
              <div className="metric-label">Del diseño pensado para vender, no para decorar</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ "--w": "85%" } as React.CSSProperties} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
           AGENDA (CALENDLY) SECTION
      ═══════════════════════════════════ */}
      <section id="agenda" className="relative z-[2] px-4">
        <div className="hero-orb orb-c1" />
        <div className="hero-orb orb-c2" />
        <div className="section-inner cta-inner">
          <div className="section-tag">Agendá tu Sesión</div>
          <h2 className="section-title">
            Tu embudo merece un
            <br />
            <span className="gold-text">cierre a la altura.</span>
          </h2>
          <p className="section-sub text-[#7A7A9A]">
            Si ya tenés tráfico, contenido o anuncios pero tu landing no está convirtiendo
            lo que debería, es hora de hablar. Agendá 30 minutos gratuitos y
            analizamos juntos qué le falta al cierre de tu embudo.
          </p>

          {/* Calendly Widget container */}
          <div className="calendly-wrap" id="calendly-wrap">
            <div className="calendly-inner-glow" />
            <div
              className="calendly-inline-widget"
              id="calendly-widget"
              data-url="https://calendly.com/TU_USUARIO/30min?hide_gdpr_banner=1&background_color=0d0d14&text_color=e8e8f0&primary_color=f5a623"
              style={{ minWidth: "100%", height: "700px" }}
            />
          </div>

          <p className="form-note">🔒 Llamada gratuita · Sin spam · Sin compromisos</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="footer" className="relative z-[2]">
        <div className="footer-inner">
          <a
            href="#hero"
            onClick={(e) => handleSmoothScroll(e, "hero")}
            className="logo"
          >
            TheFinal<span>Page</span>
          </a>
          <p className="footer-tagline">La pieza final que le faltaba a tu embudo de ventas.</p>
          <div className="footer-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
              <Youtube className="w-4 h-4" /> YouTube
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a href="https://wa.me" target="_blank" rel="noreferrer" className="flex items-center gap-1">
              <PhoneCall className="w-4 h-4" /> WhatsApp
            </a>
          </div>
          <p className="footer-copy">© 2026 TheFinalPage · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
