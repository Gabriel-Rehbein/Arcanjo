
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function MessagesPage() {
  return (
    <Layout title="Mensagens">
      <div className="card">
        <h2>Mensagens</h2>
        <p>Converse com outros usuários na camada de comunicação.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
