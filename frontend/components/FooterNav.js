import React from "react";
import { useRouter } from "next/router";
import styles from "../styles/components/footerNav.module.css";
import { getUser } from "../utils/auth";

const items = [
  { href: "/feed", icon: "🏠" },
  { href: "/explore", icon: "🔍" },
  { href: "/create-project", icon: "➕" },
  { href: "/messages", icon: "💬" },
  { href: "/profile", icon: "👤" },
];

export default function FooterNav() {
  const router = useRouter();
  const currentUser = getUser();

  function resolveHref(href) {
    if (href === "/profile" && currentUser) {
      return `/profile?username=${currentUser}`;
    }

    return href;
  }

  function isActive(href) {
    if (href === "/profile") return router.pathname === "/profile";
    return router.pathname === href;
  }

  return (
    <nav className={styles.footerNav}>
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          className={`${styles.item} ${isActive(item.href) ? styles.active : ""}`}
          onClick={() => router.push(resolveHref(item.href))}
          aria-label={item.href.replace("/", "") || "inicio"}
        >
          <span>{item.icon}</span>
        </button>
      ))}
    </nav>
  );
}
