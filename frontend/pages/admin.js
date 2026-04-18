
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function AdminPage() {
  return (
    <Layout title="Admin">
      <div className="card">
        <h2>Painel de administração</h2>
        <p>Área administrativa para gestão de conteúdo e usuários.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
