import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { getUser, getToken, logout } from "../utils/auth";
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
    setTheme(localStorage.getItem("arcanjo_theme") || "dark");
  }, [router]);

  function handleThemeChange(value) {
    setTheme(value);
    localStorage.setItem("arcanjo_theme", value);
    document.documentElement.dataset.theme = value;
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

              <label>
                Tema
                <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                </select>
              </label>

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
