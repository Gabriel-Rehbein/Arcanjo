
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function FeedPage() {
  return (
    <Layout title="Feed">
      <div className="card">
        <h2>Feed de projetos</h2>
        <p>Veja atualizações e compartilhe trabalhos com a comunidade.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
