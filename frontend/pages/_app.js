import "../styles/globals.css";
import "../styles/responsive.css";
import { useEffect } from "react";
import { LoadingProvider } from '../contexts/LoadingContext';
import LoadingOverlay from '../components/LoadingOverlay';
import SplashScreen from '../components/SplashScreen';
import { applyTheme, getStoredTheme } from "../utils/theme";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <LoadingProvider>
      <SplashScreen />
      <LoadingOverlay />
      <Component {...pageProps} />
    </LoadingProvider>
  );
}
