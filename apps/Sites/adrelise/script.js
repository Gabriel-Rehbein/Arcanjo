// =====================
//  Adrelise – Utilidades
// =====================
(() => {
  // Evita inicializar duas vezes (caso o script seja importado mais de uma vez)
  if (window.__adrelise_header_init__) return;
  window.__adrelise_header_init__ = true;

  // Ano dinâmico no footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Referências do header/nav
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');

  // Descobre a altura do header para usar no offset do scroll
  const getHeaderH = () => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
    const varNum = parseInt(cssVar, 10);
    return (Number.isFinite(varNum) && varNum > 0)
      ? varNum
      : (header?.getBoundingClientRect().height || 64);
  };

  // Abre/fecha menu mobile
  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // trava o scroll só quando o menu está aberto
    document.body.style.overflow = open ? 'hidden' : '';
  };

  // Handlers do menu (mobile)
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      setMenu(open);
      // animação do ícone (classe opcional)
      toggle.classList.toggle('active', open);
    });

    // Fecha o menu ao clicar em qualquer link dentro da nav
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      setMenu(false);
      toggle.classList.remove('active');
    });
  }

  // Scroll suave com offset do header
  document.querySelectorAll('.nav a[href^="#"], a[href^="#"][data-smooth]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = window.scrollY + target.getBoundingClientRect().top - getHeaderH();

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Fecha o menu se a viewport voltar ao desktop/tablet
  const onResize = () => {
    if (window.innerWidth >= 769) {
      setMenu(false);
      toggle?.classList.remove('active');
    }
  };
  window.addEventListener('resize', onResize);

  // Reveal on scroll (para .reveal)
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Play/Pause do vídeo ao clicar (suporta múltiplos vídeos)
  document.querySelectorAll('.video-card video').forEach((vid) => {
    vid.addEventListener('click', () => {
      if (vid.paused) vid.play(); else vid.pause();
    });
  });
})();
