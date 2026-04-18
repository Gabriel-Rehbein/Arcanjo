
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';

export default function CalendarPage() {
  return (
    <Layout title="Calendário">
      <div className="card">
        <h2>Calendário</h2>
        <p>Agende e visualize eventos e prazos importantes.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
