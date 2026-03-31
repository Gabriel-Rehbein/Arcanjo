document.addEventListener("DOMContentLoaded", async () => {
  await injectGlobalFooter();
  highlightCurrentFooterPage();
});

async function injectGlobalFooter() {
  const footerHost = document.getElementById("globalFooter");
  if (!footerHost) return;

  try {
    const response = await fetch("components/footer-nav.html");
    const html = await response.text();

    footerHost.innerHTML = `
      <div class="social-footer-wrapper">
        ${html}
      </div>
    `;
  } catch (error) {
    console.error("Erro ao carregar rodapé global:", error);

    footerHost.innerHTML = `
      <div class="social-footer-wrapper">
        <nav class="social-footer-nav" aria-label="Navegação principal">
          <a href="feed.html" class="footer-item" data-page="feed"><span class="footer-icon">🏠</span><span class="footer-label">Feed</span></a>
          <a href="profile.html" class="footer-item" data-page="profile"><span class="footer-icon">👤</span><span class="footer-label">Perfil</span></a>
          <a href="dashboard.html" class="footer-item" data-page="dashboard"><span class="footer-icon">📊</span><span class="footer-label">Dashboard</span></a>
          <a href="calendar.html" class="footer-item" data-page="calendar"><span class="footer-icon">📅</span><span class="footer-label">Calendário</span></a>
          <a href="diary.html" class="footer-item" data-page="diary"><span class="footer-icon">📔</span><span class="footer-label">Diário</span></a>
          <a href="settings.html" class="footer-item" data-page="settings"><span class="footer-icon">⚙️</span><span class="footer-label">Config.</span></a>
        </nav>
      </div>
    `;
  }
}

function highlightCurrentFooterPage() {
  const path = window.location.pathname.toLowerCase();

  let currentPage = "";

  if (path.includes("feed")) currentPage = "feed";
  else if (path.includes("profile")) currentPage = "profile";
  else if (path.includes("dashboard")) currentPage = "dashboard";
  else if (path.includes("calendar")) currentPage = "calendar";
  else if (path.includes("diary")) currentPage = "diary";
  else if (path.includes("settings")) currentPage = "settings";

  document.querySelectorAll(".footer-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === currentPage);
  });
}