import "../styles/globals.css";
import "../styles/responsive.css";
import { useEffect } from "react";
import Head from "next/head";
import { LoadingProvider } from '../contexts/LoadingContext';
import LoadingOverlay from '../components/LoadingOverlay';
import SplashScreen from '../components/SplashScreen';
import FooterNav from '../components/FooterNav';
import { applyTheme, getStoredTheme } from "../utils/theme";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideMobileNav = ["/", "/register", "/saiba-mais"].includes(router.pathname);

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <LoadingProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <SplashScreen />
      <LoadingOverlay />
      <Component {...pageProps} />
      {!hideMobileNav && <FooterNav />}
    </LoadingProvider>
  );
}
