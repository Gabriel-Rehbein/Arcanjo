
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function SettingsPage() {
  return (
    <Layout title="Configurações">
      <div className="card">
        <h2>Configurações</h2>
        <p>Esta camada permite centralizar as preferências do usuário.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
