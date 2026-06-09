import "../styles/globals.css";
import "../styles/responsive.css";
import { useEffect } from "react";
import { LoadingProvider } from '../contexts/LoadingContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { applyTheme, getStoredTheme } from "../utils/theme";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <LoadingProvider>
      <LoadingOverlay />
      <Component {...pageProps} />
    </LoadingProvider>
  );
}
