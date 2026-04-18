
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function TestFeaturesPage() {
  return (
    <Layout title="Test Features">
      <div className="card">
        <h2>Teste de funcionalidades</h2>
        <p>Use esta página para prototipar e validar recursos adicionais.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
