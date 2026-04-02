document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const top = document.querySelector(".top");
  const topbar = document.querySelector(".topbar");
  const toolbar = document.querySelector(".feed-toolbar");
  const feedStats = document.getElementById("feedStats");
  const feedList = document.getElementById("feedList");
  const modal = document.getElementById("projectPreviewModal");
  const modalBox = document.querySelector(".project-preview-box");
  const closeModalBtn = document.getElementById("closePreviewModal");

  injectAnimationStyles();
  animateInitialLayout();
  initScrollEffects();
  initButtonsMagnetic();
  initRippleEffect();
  initInputAnimations();
  initHoverTilt();
  observeDynamicFeed();
  observeStatsCounters();
  initModalAnimations();
  randomAmbientPulse();
  addFloatingParticles();
  animateOnMouseMoveGlow();

  function injectAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }

      body {
        overflow-x: hidden;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.06), transparent 18%),
          radial-gradient(circle at 20% 20%, rgba(255,255,255,.03), transparent 25%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,.025), transparent 24%);
        z-index: 0;
        transition: background .18s linear;
      }

      .top, .feed-page, #globalFooter, .project-preview-modal {
        position: relative;
        z-index: 1;
      }

      .anim-hidden {
        opacity: 0;
        transform: translateY(24px) scale(.98);
        filter: blur(8px);
      }

      .anim-show {
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
        filter: blur(0) !important;
        transition:
          opacity .75s ease,
          transform .75s cubic-bezier(.22,1,.36,1),
          filter .75s ease;
      }

      .top.scrolled {
        backdrop-filter: blur(18px);
        transform: translateY(0);
        box-shadow: 0 10px 40px rgba(0,0,0,.18);
        transition: .35s ease;
      }

      .topbar.parallax {
        transition: transform .18s linear;
      }

      .btn,
      .input,
      .feed-toolbar select,
      .feed-toolbar input,
      .close-preview-btn {
        transition:
          transform .24s ease,
          box-shadow .24s ease,
          background .24s ease,
          border-color .24s ease,
          opacity .24s ease;
        will-change: transform;
      }

      .btn:hover,
      .close-preview-btn:hover {
        transform: translateY(-3px) scale(1.02);
      }

      .btn:active,
      .close-preview-btn:active {
        transform: translateY(0) scale(.97);
      }

      .input:focus,
      .feed-toolbar select:focus {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 0 0 4px rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.18);
        outline: none;
      }

      .ripple {
        position: absolute;
        border-radius: 999px;
        transform: scale(0);
        animation: rippleAnim .7s ease-out forwards;
        background: rgba(255,255,255,.22);
        pointer-events: none;
        z-index: 2;
      }

      @keyframes rippleAnim {
        to {
          transform: scale(12);
          opacity: 0;
        }
      }

      .float-soft {
        animation: floatSoft 4.5s ease-in-out infinite;
      }

      @keyframes floatSoft {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }

      .pulse-soft {
        animation: pulseSoft 2.2s ease-in-out infinite;
      }

      @keyframes pulseSoft {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255,255,255,.08);
        }
        50% {
          transform: scale(1.02);
          box-shadow: 0 0 0 14px rgba(255,255,255,0);
        }
      }

      .feed-tilt {
        transform-style: preserve-3d;
        transition: transform .2s ease, box-shadow .2s ease;
      }

      .modal-opening {
        animation: modalFadeIn .35s ease forwards;
      }

      .modal-closing {
        animation: modalFadeOut .25s ease forwards;
      }

      .modal-box-opening {
        animation: modalBoxIn .4s cubic-bezier(.22,1,.36,1) forwards;
      }

      .modal-box-closing {
        animation: modalBoxOut .22s ease forwards;
      }

      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes modalFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes modalBoxIn {
        from {
          opacity: 0;
          transform: translateY(25px) scale(.92) rotateX(8deg);
          filter: blur(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1) rotateX(0deg);
          filter: blur(0);
        }
      }

      @keyframes modalBoxOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(20px) scale(.94);
        }
      }

      .ambient-particle {
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,.08);
        pointer-events: none;
        z-index: 0;
        animation: ambientMove linear infinite;
      }

      @keyframes ambientMove {
        from {
          transform: translateY(110vh) scale(.7);
          opacity: 0;
        }
        15% {
          opacity: 1;
        }
        to {
          transform: translateY(-20vh) scale(1.2);
          opacity: 0;
        }
      }

      .click-bounce {
        animation: clickBounce .35s ease;
      }

      @keyframes clickBounce {
        0% { transform: scale(1); }
        35% { transform: scale(.95); }
        70% { transform: scale(1.04); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  function animateInitialLayout() {
    const initialTargets = [
      document.querySelector(".top"),
      document.querySelector(".feed-toolbar"),
      document.getElementById("feedStats"),
      document.getElementById("feedList")
    ].filter(Boolean);

    initialTargets.forEach((el, index) => {
      el.classList.add("anim-hidden");
      setTimeout(() => el.classList.add("anim-show"), 120 + index * 120);
    });

    const headerActions = document.querySelectorAll(".actions .btn");
    headerActions.forEach((btn, i) => {
      btn.style.opacity = "0";
      btn.style.transform = "translateY(-10px)";
      setTimeout(() => {
        btn.style.transition = "opacity .5s ease, transform .5s ease";
        btn.style.opacity = "1";
        btn.style.transform = "translateY(0)";
      }, 300 + i * 90);
    });
  }

  function initScrollEffects() {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;

      if (top) {
        top.classList.toggle("scrolled", y > 14);
      }

      if (topbar) {
        topbar.classList.add("parallax");
        topbar.style.transform = `translateY(${Math.min(y * 0.08, 12)}px)`;
      }

      if (toolbar) {
        const rotate = Math.sin(y * 0.01) * 0.4;
        toolbar.style.transform = `translateY(${Math.min(y * 0.02, 8)}px) rotate(${rotate}deg)`;
      }
    }, { passive: true });
  }

  function initButtonsMagnetic() {
    const magneticItems = document.querySelectorAll(".btn, .close-preview-btn");

    magneticItems.forEach((item) => {
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        item.style.transform = `translate(${x * 0.10}px, ${y * 0.10}px) scale(1.03)`;
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "";
      });

      item.addEventListener("click", () => {
        item.classList.remove("click-bounce");
        void item.offsetWidth;
        item.classList.add("click-bounce");
      });
    });
  }

  function initRippleEffect() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest(".btn, .input, .feed-toolbar select, .close-preview-btn");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";

      const size = Math.max(rect.width, rect.height) / 3;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      const computedPosition = getComputedStyle(target).position;
      if (computedPosition === "static") {
        target.style.position = "relative";
      }

      target.style.overflow = "hidden";
      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), 700);
    });
  }

  function initInputAnimations() {
    const inputs = document.querySelectorAll(".input, .feed-toolbar select");

    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.classList.add("pulse-soft");
      });

      input.addEventListener("blur", () => {
        input.classList.remove("pulse-soft");
      });

      input.addEventListener("input", () => {
        input.style.transform = "scale(1.015)";
        clearTimeout(input._typingTimer);
        input._typingTimer = setTimeout(() => {
          input.style.transform = "";
        }, 140);
      });
    });
  }

  function initHoverTilt() {
    const applyTilt = (el) => {
      if (!el || el.dataset.tiltReady === "1") return;

      el.dataset.tiltReady = "1";
      el.classList.add("feed-tilt");

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rx = ((y - cy) / cy) * -4;
        const ry = ((x - cx) / cx) * 4;

        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px) scale(1.01)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0) scale(1)";
      });
    };

    document.querySelectorAll(".feed-card, .project-card, .stat-card, .post-card, .card").forEach(applyTilt);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(".feed-card, .project-card, .stat-card, .post-card, .card").forEach(applyTilt);
    });

    if (feedList) observer.observe(feedList, { childList: true, subtree: true });
    if (feedStats) observer.observe(feedStats, { childList: true, subtree: true });
  }

  function observeDynamicFeed() {
    if (!feedList) return;

    const reveal = (elements) => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-show");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      elements.forEach((el, i) => {
        el.classList.add("anim-hidden");
        el.style.transitionDelay = `${i * 80}ms`;
        io.observe(el);
      });
    };

    const observer = new MutationObserver(() => {
      const cards = [...feedList.children].filter(el => !el.dataset.animReady);
      cards.forEach(card => {
        card.dataset.animReady = "1";
        card.classList.add("float-soft");
      });
      reveal(cards);
    });

    observer.observe(feedList, { childList: true });
  }

  function observeStatsCounters() {
    if (!feedStats) return;

    const animateNumber = (el) => {
      if (!el || el.dataset.counted === "1") return;

      const text = el.textContent || "";
      const num = parseInt(text.replace(/\D/g, ""), 10);
      if (Number.isNaN(num)) return;

      el.dataset.counted = "1";
      let current = 0;
      const duration = 900;
      const stepTime = Math.max(16, Math.floor(duration / Math.max(num, 1)));

      const timer = setInterval(() => {
        current += Math.ceil(num / 30);
        if (current >= num) {
          current = num;
          clearInterval(timer);
        }

        const suffix = text.replace(/[0-9]/g, "").trim();
        el.textContent = suffix ? `${current} ${suffix}` : `${current}`;
      }, stepTime);
    };

    const scan = () => {
      feedStats.querySelectorAll("*").forEach((node) => {
        if (node.children.length === 0 && /\d/.test(node.textContent || "")) {
          animateNumber(node);
        }
      });
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scan();
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });

    io.observe(feedStats);

    const mo = new MutationObserver(() => scan());
    mo.observe(feedStats, { childList: true, subtree: true });
  }

  function initModalAnimations() {
    if (!modal || !modalBox) return;

    const modalObserver = new MutationObserver(() => {
      const isVisible =
        modal.classList.contains("active") ||
        modal.classList.contains("open") ||
        getComputedStyle(modal).display !== "none" && getComputedStyle(modal).visibility !== "hidden" && modal.offsetParent !== null;

      if (isVisible) {
        modal.classList.remove("modal-closing");
        modalBox.classList.remove("modal-box-closing");
        modal.classList.add("modal-opening");
        modalBox.classList.add("modal-box-opening");
      }
    });

    modalObserver.observe(modal, {
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("modal-opening");
        modalBox.classList.remove("modal-box-opening");
        modal.classList.add("modal-closing");
        modalBox.classList.add("modal-box-closing");
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("modal-opening");
        modalBox.classList.remove("modal-box-opening");
        modal.classList.add("modal-closing");
        modalBox.classList.add("modal-box-closing");
      }
    });
  }

  function randomAmbientPulse() {
    setInterval(() => {
      const cards = document.querySelectorAll(".feed-card, .project-card, .post-card, .card, .stat-card");
      if (!cards.length) return;

      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      randomCard.classList.add("pulse-soft");

      setTimeout(() => {
        randomCard.classList.remove("pulse-soft");
      }, 1800);
    }, 2400);
  }

  function addFloatingParticles() {
    for (let i = 0; i < 14; i++) {
      const particle = document.createElement("span");
      particle.className = "ambient-particle";
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.animationDuration = `${10 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.opacity = `${0.15 + Math.random() * 0.35}`;
      particle.style.width = `${4 + Math.random() * 8}px`;
      particle.style.height = particle.style.width;
      document.body.appendChild(particle);
    }
  }

  function animateOnMouseMoveGlow() {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      body.style.setProperty("--mx", `${x}%`);
      body.style.setProperty("--my", `${y}%`);
    });
  }
});

// BOTÃO VOLTAR AO TOPO
(function initScrollTopButton() {
  const btn = document.createElement("button");
  btn.id = "scrollTopBtn";
  btn.innerHTML = "↑";

  document.body.appendChild(btn);

  const style = document.createElement("style");
  style.textContent = `
    #scrollTopBtn {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 22px;
      background: linear-gradient(135deg, #ffffff, #dcdcdc);
      color: #000;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      opacity: 0;
      transform: translateY(20px) scale(.9);
      transition: all .3s ease;
      z-index: 9999;
    }

    #scrollTopBtn.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #scrollTopBtn:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 40px rgba(0,0,0,.35);
    }

    #scrollTopBtn:active {
      transform: scale(.9);
    }
  `;
  document.head.appendChild(style);

  // mostrar/esconder
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  // subir suave
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // animação extra ao clicar
    btn.classList.add("click-bounce");
    setTimeout(() => btn.classList.remove("click-bounce"), 300);
  });
})();