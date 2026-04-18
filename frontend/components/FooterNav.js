
import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/feed', label: 'Feed' },
  { href: '/profile', label: 'Perfil' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/calendar', label: 'Calendário' },
  { href: '/diary', label: 'Diário' },
  { href: '/settings', label: 'Config.' },
];

export default function FooterNav() {
  const { pathname } = useRouter();
  return (
    <nav className="footer-nav" aria-label="Navegação principal">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={`footer-link${pathname === link.href ? ' active' : ''}`}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
