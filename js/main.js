/* ----------------------------------------------------------
   SETUP: paste your free Web3Forms access key here.
   Get one at https://web3forms.com (enter contact@livearkexports.co.uk;
   the key arrives by email). Submissions are emailed to that address.
   ---------------------------------------------------------- */
const ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

const CONTACT_EMAIL = "contact@livearkexports.co.uk";
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
const motion = hasGSAP && !reduceMotion;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
}

/* ---------- smooth scroll ---------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToEl = (el) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el.id === "home" ? 0 : el, { offset: -60, duration: 1.6 });
  else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
};
$$("[data-scroll-to]").forEach((a) => a.addEventListener("click", (e) => {
  const target = document.querySelector(a.getAttribute("href"));
  if (!target) return;
  e.preventDefault();
  setNav(false);
  scrollToEl(target);
}));

/* ---------- header, progress, nav ---------- */
const header = $("[data-header]");
const progress = $("[data-progress]");
let lastScroll = window.scrollY;
const onScrollChrome = () => {
  const y = window.scrollY;
  const max = root.scrollHeight - window.innerHeight;
  header.classList.toggle("is-scrolled", y > 40);
  if (!document.body.classList.contains("nav-open")) header.classList.toggle("is-hidden", y > 400 && y > lastScroll + 2);
  if (y < lastScroll - 2) header.classList.remove("is-hidden");
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  lastScroll = y;
};
window.addEventListener("scroll", onScrollChrome, { passive: true });
onScrollChrome();

const navToggle = $("[data-nav-toggle]");
function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (lenis) open ? lenis.stop() : lenis.start();
}
navToggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });

const navLinks = new Map($$("[data-nav]").map((a) => [a.hash.slice(1), a]));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) navLinks.forEach((a, id) => a.classList.toggle("is-active", id === entry.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

/* ---------- hero video: pause off-screen ---------- */
const heroVideo = $(".hero__video");
if (heroVideo) {
  if (reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }
  else new IntersectionObserver(([e]) => (e.isIntersecting ? heroVideo.play().catch(() => {}) : heroVideo.pause())).observe(heroVideo);
}

/* ---------- counters ---------- */
const formatNum = (n) => Math.round(n).toLocaleString("en-US");
function countUp(el, delay = 0) {
  const end = Number(el.dataset.count);
  if (!motion) { el.textContent = formatNum(end); return; }
  const o = { v: 0 };
  el.textContent = "0";
  gsap.to(o, { v: end, duration: 2.2, delay, ease: "power3.out", onUpdate: () => (el.textContent = formatNum(o.v)) });
}

/* ---------- preloader + hero intro ---------- */
function heroIntro() {
  const title = $("[data-hero-title]");
  const fades = $$("[data-hero-fade]");
  const stats = $$("[data-hero-stat]");
  if (!motion) {
    [title, ...fades, ...stats].forEach((el) => (el.style.visibility = "visible"));
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  gsap.set(title, { autoAlpha: 1 });
  if (window.SplitText) {
    const split = SplitText.create(title, { type: "words", mask: "words" });
    tl.from(split.words, { yPercent: 100, duration: 1.8, stagger: 0.09, ease: "expo.out" }, 0);
  } else {
    tl.from(title, { y: 40, autoAlpha: 0, duration: 1.6 }, 0);
  }
  tl.fromTo("[data-hero-media]", { scale: 1.12 }, { scale: 1, duration: 3.2, ease: "power2.out" }, 0)
    .fromTo(".hero .eyebrow__dot", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.2)
    .fromTo(fades, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.6, stagger: 0.16 }, 0.6)
    .fromTo(stats, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.6, stagger: 0.14 }, 0.95)
    .add(() => $$("[data-hero-stat] [data-count]").forEach((el, i) => countUp(el, i * 0.12)), 1);
}

const preloader = $("[data-preloader]");
const markLoaded = () => { try { sessionStorage.setItem("la-loaded", "1"); } catch (e) { /* storage unavailable */ } };
if (preloader && motion && !root.classList.contains("no-preload")) {
  lenis?.stop();
  gsap.timeline({ onComplete: () => { preloader.remove(); lenis?.start(); markLoaded(); } })
    .to("[data-preloader-bar]", { scaleX: 1, duration: 1.1, ease: "power2.inOut" })
    .to(".preloader__inner", { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in" }, "+=0.05")
    .fromTo(preloader, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" }, "-=0.1")
    .add(heroIntro, "-=0.6");
} else {
  preloader?.remove();
  markLoaded();
  heroIntro();
}

/* ---------- scroll reveals ---------- */
function initReveals() {
  if (!motion) return;

  if (window.SplitText) {
    $$("[data-split]").forEach((el) => {
      const split = SplitText.create(el, { type: "words", mask: "words" });
      gsap.from(split.words, {
        yPercent: 100, duration: 1.6, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
    $$("[data-split-lines]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.6, ease: "expo.out", stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });
  }

  $$(".section .eyebrow__dot, .fleet .eyebrow__dot, .cta .eyebrow__dot").forEach((line) => {
    gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: line, start: "top 90%" } });
  });

  gsap.set("[data-reveal]", { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.5, ease: "power3.out", stagger: 0.14, overwrite: true }),
  });

  $$("[data-stagger]").forEach((group) => {
    gsap.fromTo(group.children, { autoAlpha: 0, y: 34 }, {
      autoAlpha: 1, y: 0, duration: 1.5, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: group, start: "top 86%" },
    });
  });

  $$("[data-wipe]").forEach((el) => {
    const img = $("img", el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
    tl.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "power3.inOut", clearProps: "clipPath" });
    if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0.1);
  });

  $$("[data-parallax-img]").forEach((img) => {
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: -15, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  gsap.to("[data-hero-media]", { yPercent: 16, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__content", { yPercent: -10, opacity: 0.25, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
  gsap.fromTo("[data-cta-img]", { yPercent: -10, scale: 1.15 }, { yPercent: 10, scale: 1, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });

  const word = $("[data-footer-word]");
  if (word) {
    word.textContent = word.textContent.repeat(3);
    gsap.fromTo(word, { xPercent: 0 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  const svcBar = $("[data-services-progress]");
  if (svcBar) gsap.to(svcBar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".service-list", start: "top 60%", end: "bottom 60%", scrub: true } });

  // stacking cards scale back as the next one slides over
  const cards = $$("[data-stack-card]");
  cards.forEach((c, i) => c.style.setProperty("--i", i));
  gsap.matchMedia().add("(min-width: 900px)", () => {
    cards.slice(0, -1).forEach((card, i) => {
      gsap.to(card, {
        scale: 0.94 + i * 0.015, filter: "brightness(.55)", ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: `top ${120 + (i + 1) * 30}px`, scrub: true },
      });
    });
  });
}

/* ---------- marquee: slow, steady ticker ---------- */
function initMarquee() {
  $$("[data-marquee]").forEach((row) => {
    const track = $(".marquee__track", row);
    while (row.scrollWidth < window.innerWidth * 2.2) {
      const clone = track.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      row.append(clone);
    }
    if (!motion) return;
    const dir = Number(row.dataset.marquee);
    let w = track.offsetWidth;
    let x = dir < 0 ? -w : 0;
    window.addEventListener("resize", () => { w = track.offsetWidth; });
    gsap.ticker.add((_, dt) => {
      x -= 0.022 * dt * dir;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      gsap.set(row, { x });
    });
  });
}

/* ---------- fleet: pinned horizontal scroll + spec drawer ---------- */
function initFleet() {
  const fleet = $("[data-fleet]");
  const track = $("[data-fleet-track]");
  const viewport = $("[data-fleet-viewport]");
  const current = $("[data-fleet-current]");
  const bar = $("[data-fleet-bar]");
  const total = $$(".vessel", track).length;
  const hud = (p) => {
    current.textContent = String(Math.min(total, Math.round(p * (total - 1)) + 1)).padStart(2, "0");
    bar.style.transform = `scaleX(${p})`;
  };
  viewport.addEventListener("scroll", () => {
    if (fleet.classList.contains("is-pinned")) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    hud(max > 0 ? viewport.scrollLeft / max : 0);
  }, { passive: true });

  if (motion) {
    gsap.matchMedia().add("(min-width: 900px)", () => {
        fleet.classList.add("is-pinned");
        const dist = () => track.scrollWidth - root.clientWidth;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: fleet, start: "top top", end: () => `+=${dist()}`,
            pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: (self) => hud(self.progress),
          },
        });
        $$(".vessel", track).forEach((card) => {
          gsap.fromTo($(".vessel__media img", card), { xPercent: -4 }, {
            xPercent: 4, ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          });
        });
        return () => { fleet.classList.remove("is-pinned"); gsap.set(track, { x: 0 }); };
    });
  }

  const drawer = $("[data-vessel-dialog]");
  const fill = (card) => {
    const img = $(".vessel__media img", card);
    const dImg = $("[data-drawer-img]", drawer);
    dImg.src = img.currentSrc || img.src;
    dImg.alt = img.alt;
    $("[data-drawer-index]", drawer).textContent = $(".vessel__index", card).textContent;
    $("[data-drawer-name]", drawer).textContent = $(".vessel__name", card).textContent;
    $("[data-drawer-chips]", drawer).innerHTML = $(".chips", card).innerHTML;
    $("[data-drawer-specs]", drawer).innerHTML = $(".specs", card).innerHTML;
  };
  track.addEventListener("click", (e) => {
    const card = e.target.closest(".vessel");
    if (!card) return;
    fill(card);
    openDialog(drawer);
  });
}

/* ---------- FAQ ---------- */
function initFaq() {
  $$("[data-faq]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq__q");
      if (!btn) return;
      const item = btn.closest(".faq");
      const willOpen = !item.classList.contains("is-open");
      $$(".faq", group).forEach((f) => {
        const open = f === item && willOpen;
        const wasOpen = f.classList.contains("is-open");
        f.classList.toggle("is-open", open);
        $(".faq__q", f).setAttribute("aria-expanded", String(open));
        const a = $(".faq__a", f);
        if (!motion) { a.style.height = open ? "auto" : "0px"; return; }
        if (open && !wasOpen) gsap.fromTo(a, { height: 0 }, { height: "auto", duration: 0.7, ease: "expo.out", onComplete: refreshSoon });
        if (!open && wasOpen) gsap.fromTo(a, { height: a.offsetHeight }, { height: 0, duration: 0.6, ease: "expo.out", onComplete: refreshSoon });
      });
      if (!motion) refreshSoon();
    });
  });
}
let refreshTimer;
function refreshSoon() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => (hasGSAP ? ScrollTrigger.refresh() : voyage.build()), 80);
}

/* ---------- soft gold light that follows the pointer on feature cards ---------- */
function initPointer() {
  if (!motion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  $$("[data-glow-card]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/* ----------------------------------------------------------
   Voyage: a big ship on a page-length sea route.
   The route hugs a side lane beside text and sweeps across
   the page in the gaps between sections. The ship's position
   is a pure function of scroll position, so it stops when
   scrolling stops and retraces the same path on the way up.
   ---------------------------------------------------------- */
const voyage = (() => {
  const layer = $("[data-voyage]");
  const svg = $("[data-voyage-svg]");
  const track = $("[data-voyage-track]");
  const wake = $("[data-voyage-wake]");
  const ship = $("[data-voyage-ship]");
  const body = $("[data-voyage-body]");
  const BEAM = 96;
  let length = 0;
  let ys = [];
  let lens = [];
  let lastY = window.scrollY;
  let goingUp = false;
  let mirror = false;
  let foam = 0;

  const lengthAtY = (y) => {
    if (!ys.length) return 0;
    if (y <= ys[0]) return 0;
    if (y >= ys[ys.length - 1]) return length;
    let lo = 0;
    let hi = ys.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ys[mid] < y) lo = mid; else hi = mid;
    }
    const t = (y - ys[lo]) / (ys[hi] - ys[lo] || 1);
    return lens[lo] + t * (lens[hi] - lens[lo]);
  };

  function build() {
    svg.setAttribute("height", "0");
    const docW = root.clientWidth;
    const docH = root.scrollHeight;
    const ref = $("main .container").getBoundingClientRect();
    const leftGap = ref.left;
    const rightGap = docW - ref.right;
    const scale = clamp((rightGap - 10) / BEAM, 0.32, 1);
    const alternate = leftGap >= BEAM * scale + 10;
    const laneX = (side) => (side === "R" ? docW - rightGap / 2 : leftGap / 2);
    body.style.setProperty("--ship-scale", scale.toFixed(3));

    const blocks = $$("[data-sea]").map((sec) => {
      const host = sec.parentElement.classList.contains("pin-spacer") ? sec.parentElement : sec;
      const box = sec.hasAttribute("data-fleet") ? host : ($("[data-sea-content]", sec) || sec);
      const r = box.getBoundingClientRect();
      return { top: r.top + window.scrollY - 24, bottom: r.bottom + window.scrollY + 24 };
    });

    let side = "R";
    let y = 0;
    let d = `M ${laneX(side)} 0`;
    blocks.forEach((b, i) => {
      const gap = b.top - y;
      if (i > 0 && alternate && gap > 90) {
        const next = side === "R" ? "L" : "R";
        const k = gap * 0.5;
        d += ` L ${laneX(side)} ${y} C ${laneX(side)} ${y + k} ${laneX(next)} ${b.top - k} ${laneX(next)} ${b.top}`;
        side = next;
      }
      y = Math.max(y, b.bottom);
      d += ` L ${laneX(side)} ${y}`;
    });
    d += ` L ${laneX(side)} ${Math.max(docH, y + 1)}`;

    svg.setAttribute("width", docW);
    svg.setAttribute("height", docH);
    svg.setAttribute("viewBox", `0 0 ${docW} ${docH}`);
    track.setAttribute("d", d);
    wake.setAttribute("d", d);
    length = track.getTotalLength();
    wake.style.strokeDasharray = `${length} ${length}`;

    ys = [];
    lens = [];
    for (let l = 0; l <= length; l += 6) {
      const p = track.getPointAtLength(l);
      if (!ys.length || p.y > ys[ys.length - 1]) { ys.push(p.y); lens.push(l); }
    }
    render(true);
  }

  function render(force) {
    if (!length) return;
    const sy = window.scrollY;
    const ih = window.innerHeight;
    const max = root.scrollHeight - ih;
    const p = max > 0 ? clamp(sy / max, 0, 1) : 0;
    const at = lengthAtY(sy + ih * (0.26 + 0.54 * p));
    const pt = track.getPointAtLength(at);
    const a = track.getPointAtLength(Math.max(0, at - 3));
    const b = track.getPointAtLength(Math.min(length, at + 3));
    const pathAngle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

    if (sy !== lastY) {
      const up = sy < lastY;
      if (up !== goingUp) { goingUp = up; mirror = !mirror; }
    }
    const heading = pathAngle + (goingUp ? 180 : 0);
    let rot = mirror ? heading - 180 : heading;
    if (Math.cos((rot * Math.PI) / 180) < -0.3) {
      mirror = !mirror;
      rot = mirror ? heading - 180 : heading;
    }

    ship.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    body.classList.toggle("is-reversed", mirror);
    wake.style.strokeDashoffset = String(length - at);

    const speed = Math.abs(sy - lastY);
    foam += (Math.min(1, speed / 10) - foam) * (force ? 1 : 0.12);
    body.style.setProperty("--foam", foam.toFixed(3));
    lastY = sy;
  }

  if (hasGSAP) {
    ScrollTrigger.addEventListener("refresh", build);
    gsap.ticker.add(() => render(false));
  } else {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(false); }); }
    }, { passive: true });
    window.addEventListener("resize", build);
    window.addEventListener("load", build);
  }
  if (layer) build();
  return { build, render };
})();

/* ---------- dialogs ---------- */
function openDialog(dialog) {
  setNav(false);
  $$("dialog[open]").forEach((d) => d !== dialog && d.close());
  if (typeof dialog.showModal !== "function") return;
  dialog.showModal();
  document.body.classList.add("dialog-open");
  lenis?.stop();
}
$$("dialog").forEach((dialog) => {
  $("[data-close-dialog]", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    if (!$("dialog[open]")) { document.body.classList.remove("dialog-open"); lenis?.start(); }
  });
});
const contactDialog = $("[data-contact-dialog]");
$$("[data-open-contact]").forEach((btn) => btn.addEventListener("click", () => {
  if (typeof contactDialog.showModal !== "function") { scrollToEl($("#contact")); return; }
  openDialog(contactDialog);
  $("input:not(.hp)", contactDialog).focus();
}));

/* ---------- contact form → Web3Forms ---------- */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
$$("[data-contact-form]").forEach((form) => {
  const status = $(".form-status", form);
  const submit = $("[type=submit]", form);
  const setStatus = (html, kind) => {
    status.innerHTML = html;
    status.className = `form-status${kind ? ` is-${kind}` : ""}`;
  };
  form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const first = form.elements.first_name;
    const email = form.elements.email;
    const invalid = [];
    if (!first.value.trim()) invalid.push(first);
    if (!emailOk(email.value.trim())) invalid.push(email);
    invalid.forEach((el) => el.classList.add("is-invalid"));
    if (invalid.length) {
      setStatus("Please add your first name and a valid email address.", "error");
      invalid[0].focus();
      if (motion) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      return;
    }
    if (form.elements.botcheck.checked) {
      form.reset();
      setStatus("Thank you — your message has been sent.", "success");
      return;
    }
    if (!ACCESS_KEY || ACCESS_KEY.startsWith("YOUR_")) {
      setStatus(`The form isn’t connected yet. Please email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`, "error");
      return;
    }
    const name = `${first.value.trim()} ${form.elements.last_name.value.trim()}`.trim();
    const payload = {
      access_key: ACCESS_KEY,
      subject: `New enquiry from ${name} — Live Ark Export website`,
      from_name: "Live Ark Export website",
      name,
      email: email.value.trim(),
      message: form.elements.message.value.trim() || "(no message)",
      botcheck: false,
    };
    submit.disabled = true;
    submit.classList.add("is-loading");
    setStatus("Sending…");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`);
      form.reset();
      setStatus("Thank you — your message has been sent. We’ll be in touch shortly.", "success");
    } catch {
      setStatus(`Sorry, something went wrong. Please email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`, "error");
    } finally {
      submit.disabled = false;
      submit.classList.remove("is-loading");
    }
  });
});

/* ---------- boot ---------- */
initMarquee();
initFleet();
initFaq();
initPointer();
const boot = () => {
  initReveals();
  if (hasGSAP) ScrollTrigger.refresh(); else voyage.build();
};
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
window.addEventListener("load", refreshSoon);
