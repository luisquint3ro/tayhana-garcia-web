// Tayhana García · interacciones
document.addEventListener("DOMContentLoaded", () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Revelado: si el navegador no anima con scroll en CSS, usar IntersectionObserver
  if (!CSS.supports("animation-timeline: view()")) {
    document.documentElement.classList.add("no-sda");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".sd-reveal").forEach((el) => io.observe(el));
  }

  // Menú: se vuelve vidrio al bajar; menú móvil
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const bar = document.querySelector(".anuncio");
  const onScroll = () => {
    nav.classList.toggle("is-solid", scrollY > 60);
    if (bar) document.documentElement.style.setProperty("--nav-top", Math.max(0, bar.offsetHeight - scrollY) + "px");
  };
  addEventListener("resize", onScroll);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Cerrar" : "Menú";
  });
  nav.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("is-open"); toggle.textContent = "Menú"; toggle.setAttribute("aria-expanded", false);
  }));

  // Cifras que suben al aparecer
  const nums = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suf || "";
    cio.unobserve(el);
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  nums.forEach((n) => { n.textContent = "0" + (n.dataset.suf || ""); cio.observe(n); });

  // Video de Completita: carga el reproductor solo al hacer clic (más rápido)
  const poster = document.getElementById("videoPoster");
  if (poster) poster.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = "https://www.youtube.com/embed/videoseries?list=UUbIRmtzRH1b8939iHABEyog&autoplay=1";
    f.title = "Episodios recientes de Completita Podcast";
    f.allow = "autoplay; encrypted-media; picture-in-picture";
    f.allowFullscreen = true;
    poster.replaceWith(f);
  });

  // Formularios (conectar a Formspree o al formulario de Hostinger al publicar)
  const bind = (id, ok) => {
    const form = document.getElementById(id); if (!form) return;
    const msg = form.querySelector(".msg") || form.parentElement.querySelector(".msg");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const mail = form.querySelector('input[type="email"]');
      const name = form.querySelector('input[name="nombre"]');
      if ((name && !name.value.trim()) || !mail.value || !mail.checkValidity()) {
        msg.textContent = name ? "Escribe tu nombre y un correo válido para poder responderte." : "Escribe un correo válido.";
        return;
      }
      msg.textContent = ok(new FormData(form)); form.reset();
    });
  };
  bind("formContacto", (d) => `Gracias, ${d.get("nombre")}. Recibí tu solicitud y te responderé pronto.`);
  bind("formAviso", () => "Listo. Te avisaré primero cuando abra la lista.");
});
