
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function DiaryPage() {
  return (
    <Layout title="Diário">
      <div className="card">
        <h2>Diário</h2>
        <p>Registre suas ideias, notas e aprendizados aqui.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
