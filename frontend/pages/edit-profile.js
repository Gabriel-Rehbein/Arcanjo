import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FooterNav from "../components/FooterNav";
import { getUser, getToken } from "../utils/auth";
import { useRouter } from "next/router";
import { useApiFetch } from "../utils/api";
import styles from "../styles/pages/edit-profile.module.css";
import { assetPath } from "../utils/paths";

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [availableForWork, setAvailableForWork] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [selos, setSelos] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const api = useApiFetch();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    const username = getUser();
    if (!username) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const u = await api(`/users/${username}`);
        setUserData(u);
        setFullName(u.full_name || "");
        setBio(u.bio || "");
        setEmail(u.email || "");
        setRole(u.role || "");
        setTechnologies(Array.isArray(u.technologies) ? u.technologies.join(", ") : "");
        setAvailableForWork(Boolean(u.available_for_work));
        setGithubUrl(u.github_url || "");
        setLinkedinUrl(u.linkedin_url || "");
        setPortfolioUrl(u.portfolio_url || "");
        setResumeUrl(u.resume_url || "");
        setSelos(Array.isArray(u.selos) ? u.selos.map(formatSeloInput).join(", ") : "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (userData) {
      setAvatarPreview(userData.avatar_url || null);
      setBannerPreview(userData.banner_url || null);
    }
  }, [userData]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bannerFile]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        full_name: fullName,
        bio,
        email,
        role,
        technologies: technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        available_for_work: availableForWork,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        resume_url: resumeUrl,
        selos: selos
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (avatarFile) {
        payload.avatar_base64 = await readFileAsDataURL(avatarFile);
      }

      if (bannerFile) {
        payload.banner_base64 = await readFileAsDataURL(bannerFile);
      }

      const username = getUser();
      await api(`/users/${username}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      router.push(`/profile?username=${username}`);
    } catch (err) {
      alert(err.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={`card ${styles.loadingCard}`}>Carregando...</div>;

  return (
    <Layout title="Editar perfil">
      <div className={`card ${styles.editCard}`}>
        <h2 className={styles.title}>Editar perfil</h2>

        <div className={styles.previewArea}>
          <div className={styles.bannerPreview} style={{ backgroundImage: `url(${bannerPreview || assetPath('/img/logoaba.png')})` }} />

          <div className={styles.avatarWrap}>
            <img className={styles.avatarPreview} src={avatarPreview || assetPath('/img/logoaba.png')} alt="Avatar preview" onError={(e) => (e.target.src = assetPath('/img/logoaba.png'))} />
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            <span>Nome completo</span>
            <input className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>

          <label className={styles.label}>
            <span>Bio</span>
            <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>

          <label className={styles.label}>
            <span>Cargo</span>
            <input className={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Desenvolvedor Front-end" />
          </label>

          <label className={styles.label}>
            <span>Tecnologias</span>
            <input className={styles.input} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          </label>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={availableForWork} onChange={(e) => setAvailableForWork(e.target.checked)} />
            <span>Disponível para trabalho</span>
          </label>

          <label className={styles.label}>
            <span>Email</span>
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <div className={styles.fieldGrid}>
            <label className={styles.label}>
              <span>GitHub</span>
              <input className={styles.input} type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/seu-user" />
            </label>

            <label className={styles.label}>
              <span>LinkedIn</span>
              <input className={styles.input} type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/seu-user" />
            </label>

            <label className={styles.label}>
              <span>Portfólio</span>
              <input className={styles.input} type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://seusite.com" />
            </label>

            <label className={styles.label}>
              <span>Currículo</span>
              <input className={styles.input} type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </label>
          </div>

          <label className={styles.label}>
            <span>Selos</span>
            <input className={styles.input} value={selos} onChange={(e) => setSelos(e.target.value)} placeholder="✨ Novo membro, 🧪 Tester, 🤝 Colaborador" />
          </label>

          <label className={styles.labelFile}>
            <span>Foto de perfil</span>
            <input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
          </label>

          <label className={styles.labelFile}>
            <span>Banner</span>
            <input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
          </label>

          <div className={styles.actions}>
            <button className={styles.primary} type="submit">Salvar</button>
            <button className={styles.secondary} type="button" onClick={() => router.push('/profile')}>Cancelar</button>
          </div>
        </form>
      </div>

      <FooterNav />
    </Layout>
  );
}

function formatSeloInput(selo) {
  if (!selo) return "";

  if (typeof selo === "string") return selo;

  return `${selo.symbol || "◆"} ${selo.label || ""}`.trim();
}
