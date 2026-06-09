import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { getUser, getToken, logout } from "../utils/auth";
import { applyTheme, getStoredTheme, THEMES } from "../utils/theme";
import styles from "../styles/pages/settings.module.css";

export default function SettingsPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    setUsername(getUser() || "");
    setTheme(applyTheme(getStoredTheme()));
  }, [router]);

  function handleThemeChange(value) {
    setTheme(applyTheme(value));
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.settings}>
          <section className={styles.card}>
            <h2>Configurações</h2>
            <p>Gerencie sua conta, tema, privacidade e preferências.</p>

            <div className={styles.form}>
              <label>
                Usuário logado
                <input value={username} disabled />
              </label>

              <div className={styles.themeField}>
                <span>Tema</span>

                <div className={styles.themeGrid}>
                  {THEMES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={theme === item.value ? styles.themeActive : ""}
                      onClick={() => handleThemeChange(item.value)}
                      aria-pressed={theme === item.value}
                    >
                      <div className={styles.swatches}>
                        {item.colors.map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </div>

                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => router.push(`/profile?username=${username}`)}>
                Ver perfil
              </button>

              <button type="button" onClick={() => router.push("/saiba-mais")}>
                Saiba mais sobre privacidade e LGPD
              </button>

              <button type="button" className={styles.logout} onClick={handleLogout}>
                Sair da conta
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
