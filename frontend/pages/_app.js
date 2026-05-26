import "../styles/globals.css";
import "../styles/responsive.css";
import { LoadingProvider } from '../contexts/LoadingContext';
import LoadingOverlay from '../components/LoadingOverlay';

export default function App({ Component, pageProps }) {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      <Component {...pageProps} />
    </LoadingProvider>
  );
}