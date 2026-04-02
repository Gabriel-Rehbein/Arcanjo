(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qsa(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  function revealElements(selector, delayStart = 0, step = 70) {
    const elements = qsa(selector);

    elements.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";

      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, prefersReducedMotion ? 0 : delayStart + index * step);
    });
  }

  function addHoverEffect(selector) {
    const elements = qsa(selector);

    elements.forEach((el) => {
      el.style.transition = "transform 0.25s ease, box-shadow 0.25s ease";

      el.addEventListener("mouseenter", () => {
        if (prefersReducedMotion) return;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 10px 24px rgba(0,0,0,.18)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "";
      });
    });
  }

  function boot() {
    revealElements(".top", 50, 0);
    revealElements(".hero-main", 140, 0);
    revealElements(".hero-side .mini-stat", 220, 80);
    revealElements(".controls", 320, 0);
    revealElements(".section-head", 400, 80);
    revealElements(".stats-grid > *", 500, 70);
    revealElements(".featured-grid > *", 600, 70);
    revealElements("#grid > *", 700, 60);
    revealElements(".activity-grid > *", 780, 100);
    revealElements(".footer", 900, 0);

    addHoverEffect(".card");
    addHoverEffect(".mini-stat");
    addHoverEffect(".btn");
    addHoverEffect(".featured-grid > *");
    addHoverEffect("#grid > *");
    addHoverEffect(".stats-grid > *");
    addHoverEffect(".activity-grid > *");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();