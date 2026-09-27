"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/common/LenisContext";
import type { ContactScene } from "./contactScene";
import type { ContactAudio } from "./contactAudio";
import { budgetOptions, INR_OPTIONS, type BudgetOption } from "@/lib/budget";
import { BOOKING_URL } from "@/lib/booking";

/*
 * /contact: an enter gate (with / without sound), a blob reveal into a 3D
 * scene, then the scene settles into the left column while the brief form
 * slides in on the right. Desktop keeps the scene still (sticky) while the
 * form scrolls. A sun/moon button on the scene switches day and night.
 */

const BUILDING = [
  "a portfolio / personal site",
  "a marketing website",
  "a product / SaaS interface",
  "a web app or dashboard",
  "an e-commerce store",
  "not sure — let's talk",
];
const SOURCES = ["LinkedIn", "GitHub", "WhatsApp", "Referral", "Google search", "Other"];
const EMAIL = "vedank0522@gmail.com";
const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";

type Phase = "loading" | "gate" | "reveal" | "done";

// scramble a text node into place, left to right
function scramble(el: HTMLElement, delay = 0) {
  const final = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = final;
  const dur = 700 + final.length * 18;
  let start = 0;
  let raf = 0;
  const step = (now: number) => {
    if (!start) start = now + delay;
    const p = Math.max(0, (now - start) / dur);
    const reveal = Math.floor(p * final.length);
    let s = "";
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      s += i < reveal || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = s;
    if (p < 1) raf = requestAnimationFrame(step);
    else el.textContent = final;
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function ContactExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smokeRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<HTMLSpanElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ContactScene | null>(null);
  const audioRef = useRef<ContactAudio | null>(null);
  const dayState = useRef({ v: 0 });
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useLayoutEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [sound, setSound] = useState(false);
  const [isDay, setIsDay] = useState(false);
  const [high, setHigh] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  // the form <-> thank-you swap changes the page height a lot; re-measure so
  // the footer below (and its scroll reveals) line up with the new layout
  const firstSent = useRef(true);
  useEffect(() => {
    if (firstSent.current) {
      firstSent.current = false;
      return;
    }
    const id = requestAnimationFrame(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [sent]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  // budget tiers in the visitor's own currency (INR until /api/geo answers)
  const [budget, setBudget] = useState<BudgetOption[]>(INR_OPTIONS);
  useEffect(() => {
    let alive = true;
    fetch("/api/geo")
      .then((r) => r.json())
      .then((g: { currency?: string; rate?: number }) => {
        if (alive && g.currency && g.rate) setBudget(budgetOptions(g.currency, g.rate));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // ---- scene boot -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    const mobile = window.matchMedia("(max-width: 1024px)").matches;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    // count up while the scene assembles; the real work is the chair model
    const counter = { v: 0 };
    const count = gsap.to(counter, { v: 90, duration: 2.2, ease: "power1.out", onUpdate: () => setProgress(counter.v) });
    import("./contactScene").then(async ({ createContactScene }) => {
      if (disposed) return;
      const s = createContactScene(canvas, { high: !lowPower, mobile });
      sceneRef.current = s;
      if (lowPower) setHigh(false);
      await s.ready;
      if (disposed) return;
      count.kill();
      gsap.to(counter, {
        v: 100,
        duration: 0.5,
        onUpdate: () => setProgress(counter.v),
        onComplete: () => setPhase("gate"),
      });
    });
    const ro = new ResizeObserver(() => sceneRef.current?.resize());
    ro.observe(canvas);
    // pause rendering off screen / in background tabs
    const io = new IntersectionObserver(([e]) => sceneRef.current?.setActive(e.isIntersecting && !document.hidden));
    io.observe(canvas);
    const onVis = () => sceneRef.current?.setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      disposed = true;
      count.kill();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // hold the page while the gate is up
  useEffect(() => {
    const l = lenisRef.current;
    if (phase === "done") {
      l?.start();
      document.documentElement.classList.remove("ct-locked");
    } else {
      window.scrollTo(0, 0);
      l?.stop();
      document.documentElement.classList.add("ct-locked");
    }
    return () => {
      document.documentElement.classList.remove("ct-locked");
    };
  }, [phase, lenis]);

  // ---- smoke trail on the gate ----------------------------------------------
  useEffect(() => {
    const c = smokeRef.current;
    if (!c || phase === "done") return;
    const g = c.getContext("2d")!;
    const puffs: { x: number; y: number; r: number; a: number; vx: number; vy: number }[] = [];
    let lx = -1;
    let ly = -1;
    let raf = 0;
    const size = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    size();
    const move = (e: PointerEvent) => {
      if (lx < 0) {
        lx = e.clientX;
        ly = e.clientY;
      }
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const n = Math.min(6, Math.ceil(Math.hypot(dx, dy) / 14));
      for (let i = 0; i < n; i++) {
        puffs.push({
          x: lx + (dx * i) / n,
          y: ly + (dy * i) / n,
          r: 18 + Math.random() * 16,
          a: 0.13,
          vx: dx * 0.02 + (Math.random() - 0.5) * 0.4,
          vy: dy * 0.02 - 0.25,
        });
      }
      lx = e.clientX;
      ly = e.clientY;
    };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      g.clearRect(0, 0, c.width, c.height);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.x += p.vx;
        p.y += p.vy;
        p.r += 1.3;
        p.a *= 0.965;
        if (p.a < 0.004) {
          puffs.splice(i, 1);
          continue;
        }
        const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grd.addColorStop(0, `rgba(235,235,240,${p.a})`);
        grd.addColorStop(1, "rgba(235,235,240,0)");
        g.fillStyle = grd;
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
    };
    draw();
    window.addEventListener("pointermove", move);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", size);
    };
  }, [phase]);

  // close the settings menu on a tap/click outside it, or Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const down = (e: PointerEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [settingsOpen]);

  // silence the soundscape while the tab is in the background; bring it
  // back on return if sound was on
  useEffect(() => {
    const onVis = () => {
      const a = audioRef.current;
      if (!a) return;
      a.setMuted(document.hidden || !sound);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onVis);
    };
  }, [sound]);

  // ---- level bars -------------------------------------------------------------
  useEffect(() => {
    const bars = barsRef.current ? Array.from(barsRef.current.children) as HTMLElement[] : [];
    const data = new Uint8Array(32);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const a = audioRef.current;
      if (a && sound) a.levels(data);
      else data.fill(0);
      bars.forEach((b, i) => {
        const v = sound ? 0.18 + (data[2 + i * 2] / 255) * 0.95 : 0.14;
        b.style.transform = `scaleY(${Math.min(1, v)})`;
      });
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [sound]);

  // ---- enter ------------------------------------------------------------------
  const enter = (withSound: boolean) => {
    const root = rootRef.current;
    const s = sceneRef.current;
    if (!root || !s || phase !== "gate") return;
    if (withSound) {
      import("./contactAudio").then(({ createContactAudio }) => {
        const a = createContactAudio();
        audioRef.current = a;
        a.setDay(dayState.current.v);
        a.start();
        a.whoosh();
      });
    }
    setSound(withSound);
    setPhase("reveal");
    const desktop = window.matchMedia("(min-width: 1025px)").matches;
    const st = { reveal: 0, shift: 0 };
    const panel = root.querySelector<HTMLElement>(".ct-panel")!;
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("done");
        root.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el, i) => scramble(el, i * 25));
      },
    });
    tl.to(root.querySelector(".ct-gate"), { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0);
    tl.to(st, { reveal: 1, duration: 2.4, ease: "power2.inOut", onUpdate: () => s.setReveal(st.reveal) }, 0.2);
    if (desktop) {
      gsap.set(panel, { xPercent: 100 });
      tl.to(st, { shift: 1, duration: 1.4, ease: "expo.inOut", onUpdate: () => s.setShift(st.shift) }, 2.2);
      tl.to(panel, { xPercent: 0, duration: 1.4, ease: "expo.inOut" }, 2.2);
    } else {
      tl.from(panel, { autoAlpha: 0, y: 40, duration: 1, ease: "power3.out" }, 2.1);
    }
    tl.from(root.querySelectorAll(".ct-title__line > span"), { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.08 }, desktop ? 2.9 : 2.3);
    tl.from(root.querySelector(".ct-daynight"), { autoAlpha: 0, scale: 0.6, duration: 0.8, ease: "back.out(2)" }, desktop ? 3.2 : 2.4);
  };

  // ---- day / night ------------------------------------------------------------
  const toggleDay = () => {
    const next = !isDay;
    setIsDay(next);
    audioRef.current?.click();
    audioRef.current?.setDay(next ? 1 : 0);
    gsap.to(dayState.current, {
      v: next ? 1 : 0,
      duration: 1.8,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => sceneRef.current?.setDay(dayState.current.v),
    });
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    if (next && !audioRef.current) {
      import("./contactAudio").then(({ createContactAudio }) => {
        const a = createContactAudio();
        audioRef.current = a;
        a.setDay(dayState.current.v);
        a.start();
      });
    } else {
      audioRef.current?.setMuted(!next);
      if (next) audioRef.current?.click();
    }
  };

  const toggleQuality = () => {
    const next = !high;
    setHigh(next);
    sceneRef.current?.setQuality(next);
    audioRef.current?.click();
  };

  const hover = () => audioRef.current?.hover();
  const tap = () => audioRef.current?.click();

  // ---- form -------------------------------------------------------------------
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const miss: Record<string, boolean> = {};
    ["building", "budget", "name", "email"].forEach((k) => {
      if (!get(k)) miss[k] = true;
    });
    if (get("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(get("email"))) miss.email = true;
    setErrors(miss);
    setSendError("");
    if (Object.keys(miss).length) {
      tap();
      form.querySelector(`[data-group="${Object.keys(miss)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    tap();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building: get("building"),
          budget: get("budget"),
          budgetInr: budget.find((o) => o.label === get("budget"))?.inr ?? "",
          name: get("name"),
          email: get("email"),
          picture: get("picture"),
          sources: f.getAll("source").map(String),
          company: get("company"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Couldn't send right now.");
      setSent(true);
      audioRef.current?.whoosh();
      requestAnimationFrame(() => {
        rootRef.current?.querySelector(".ct-sent")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (err) {
      setSendError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const pointer = (e: React.PointerEvent, inside: boolean) => sceneRef.current?.pointer(e.clientX, e.clientY, inside);

  return (
    <section ref={rootRef} className={`ct is-${phase} ${isDay ? "is-day" : "is-night"}`}>
      {/* ---- scene ---- */}
      <div
        className="ct-stage"
        onPointerMove={(e) => pointer(e, true)}
        onPointerLeave={(e) => pointer(e, false)}
      >
        <canvas ref={canvasRef} className="ct-canvas" aria-hidden="true" />
        <button
          type="button"
          className="ct-daynight"
          onClick={toggleDay}
          onPointerEnter={hover}
          aria-label={isDay ? "Switch to night" : "Switch to day"}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <mask id="ctMoonMask">
              <rect width="32" height="32" fill="#fff" />
              <circle className="ct-dn__bite" cx="23" cy="10" r="8" fill="#000" />
            </mask>
            <circle className="ct-dn__core" cx="16" cy="16" r="9" mask="url(#ctMoonMask)" />
            <g className="ct-dn__rays">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="16" y1="2.5" x2="16" y2="5.5" transform={`rotate(${i * 45} 16 16)`} />
              ))}
            </g>
          </svg>
          <span className="ct-daynight__label">{isDay ? "Day" : "Night"}</span>
        </button>
      </div>

      {/* ---- form panel ---- */}
      <div className="ct-panel" color-scheme="dark">
        <div className="ct-bar">
          <div
            ref={settingsRef}
            className="ct-settings"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setSettingsOpen(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setSettingsOpen(false);
            }}
          >
            <button
              type="button"
              className="ct-settings__btn"
              onClick={() => {
                // a mouse opens it on hover; taps toggle it
                if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) setSettingsOpen((v) => !v);
                tap();
              }}
              onPointerEnter={hover}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
              </svg>
              Settings
            </button>
            <div className={`ct-pop ${settingsOpen ? "is-open" : ""}`} role="menu">
              <p className="ct-pop__title">Settings</p>
              <button type="button" className="ct-pop__row" onClick={toggleSound} onPointerEnter={hover}>
                <span>Sound</span>
                <i className={`ct-switch ${sound ? "is-on" : ""}`} />
              </button>
              <button type="button" className="ct-pop__row" onClick={toggleDay} onPointerEnter={hover}>
                <span>Night mode</span>
                <i className={`ct-switch ${!isDay ? "is-on" : ""}`} />
              </button>
              <button type="button" className="ct-pop__row" onClick={toggleQuality} onPointerEnter={hover}>
                <span>Quality</span>
                <em>{high ? "High" : "Low"}</em>
              </button>
            </div>
          </div>
          <button
            type="button"
            className={`ct-levels ${sound ? "is-on" : ""}`}
            onClick={toggleSound}
            onPointerEnter={hover}
            aria-label={sound ? "Mute sound" : "Turn sound on"}
          >
            <span ref={barsRef} aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          </button>
        </div>

        <h1 className="ct-title">
          <span className="ct-title__line">
            <span>
              <em>Let&apos;s</em> build
            </span>
          </span>
          <span className="ct-title__line ct-title__line--in">
            {/* outside the animated span, so it sits under "Let's" */}
            <i aria-hidden="true">↳</i>
            <span>something</span>
          </span>
          <span className="ct-title__line">
            <span>worth keeping</span>
          </span>
        </h1>
        <p className="ct-lead">
          <span data-scramble>Tell me about the project.</span>
          <br />
          <span data-scramble>I reply within 24 hours.</span>
        </p>
        {BOOKING_URL && (
          <a className="ct-book" href={BOOKING_URL} target="_blank" rel="noreferrer" onPointerEnter={hover}>
            <span className="ct-book__dot" aria-hidden="true" />
            Rather talk? Book a quick call <span aria-hidden="true">↗</span>
          </a>
        )}

        {sent ? (
          <div className="ct-sent">
            <p className="ct-sent__title">Thank you.</p>
            <p>
              Your brief is in. A confirmation is on its way to your inbox, and I&apos;ll get back to you within 24
              hours.
            </p>
            {BOOKING_URL && (
              <a className="ct-send ct-send--book" href={BOOKING_URL} target="_blank" rel="noreferrer" onPointerEnter={hover}>
                <span>Book a call</span>
                <span className="ct-send__arrow" aria-hidden="true">↗</span>
              </a>
            )}
            <button type="button" className="ct-link" onClick={() => setSent(false)}>
              Send another brief
            </button>
          </div>
        ) : (
          <form className="ct-form" onSubmit={submit} noValidate>
            <div role="radiogroup" aria-labelledby="ct-l-building" className={`ct-group is-required ${errors.building ? "has-error" : ""}`} data-group="building">
              <p id="ct-l-building" className="ct-legend" data-scramble>I&apos;m building...</p>
              <div className="ct-options">
                {BUILDING.map((o) => (
                  <label key={o} className="ct-option" onPointerEnter={hover}>
                    <input type="radio" name="building" value={o} onChange={tap} />
                    <i />
                    <span data-scramble>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div role="radiogroup" aria-labelledby="ct-l-budget" className={`ct-group is-required ${errors.budget ? "has-error" : ""}`} data-group="budget">
              <p id="ct-l-budget" className="ct-legend" data-scramble>My budget is...</p>
              <div className="ct-options">
                {budget.map((o) => (
                  <label key={o.label} className="ct-option" onPointerEnter={hover}>
                    <input type="radio" name="budget" value={o.label} data-inr={o.inr} onChange={tap} />
                    <i />
                    <span data-scramble>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className={`ct-group ct-field is-required ${errors.name ? "has-error" : ""}`} data-group="name">
              <span className="ct-legend" data-scramble>My name is...</span>
              <input name="name" type="text" autoComplete="name" placeholder="Your name" />
            </label>

            <label className={`ct-group ct-field is-required ${errors.email ? "has-error" : ""}`} data-group="email">
              <span className="ct-legend" data-scramble>Reach me at...</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" />
            </label>

            {/* honeypot for bots */}
            <input className="ct-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <label className="ct-group ct-field">
              <span className="ct-legend" data-scramble>What I&apos;m picturing...</span>
              <textarea name="picture" rows={3} placeholder="Goals, references, timeline — anything that helps" />
            </label>

            <div role="group" aria-labelledby="ct-l-source" className="ct-group">
              <p id="ct-l-source" className="ct-legend" data-scramble>I found you through...</p>
              <div className="ct-pills">
                {SOURCES.map((o) => (
                  <label key={o} className="ct-pill" onPointerEnter={hover}>
                    <input type="checkbox" name="source" value={o} onChange={tap} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ct-submit">
              <p className="ct-note">
                {sendError ? (
                  <span className="ct-note__error">
                    {sendError} You can also write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                  </span>
                ) : (
                  "* By sending, you agree to be contacted about your project."
                )}
              </p>
              <button type="submit" className={`ct-send ${sending ? "is-sending" : ""}`} onPointerEnter={hover} disabled={sending}>
                <span className="ct-send__roll">
                  <span>{sending ? "Sending…" : "Send it"}</span>
                  <span aria-hidden="true">{sending ? "Sending…" : "Send it"}</span>
                </span>
                <span className="ct-send__arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ---- enter gate ---- */}
      <div className="ct-gate" aria-hidden={phase === "done"}>
        <canvas ref={smokeRef} className="ct-gate__smoke" aria-hidden="true" />
        <div className="ct-gate__brand">
          <img src="/monogram-white-sm.avif" alt="" width={160} height={151} />
          <p>Vedank Gaur</p>
          <span>Websites &amp; digital products,
            <br />
            designed and built end to end</span>
        </div>
        <div className="ct-gate__actions">
          {phase === "loading" ? (
            <p className="ct-gate__load">
              Experience is loading
              <br />
              <b>{String(Math.round(progress)).padStart(3, "0")}%</b>
            </p>
          ) : (
            <>
              <button type="button" className="ct-enter" onClick={() => enter(true)}>
                <span className="ct-enter__glow" aria-hidden="true" />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                  <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
                </svg>
                Enter with sound
              </button>
              <button type="button" className="ct-enter-quiet" onClick={() => enter(false)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                  <path d="m17 10 4 4m0-4-4 4" />
                </svg>
                Enter without sound
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
