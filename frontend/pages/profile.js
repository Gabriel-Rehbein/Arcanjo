
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';
import { getUser } from '../utils/auth';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <Layout title="Perfil">
      <div className="card">
        <h2>Perfil</h2>
        <p>Usuário: {user || 'visitante'}</p>
        <p>Suas informações pessoais e configurações de conta estarão aqui.</p>
      </div>
      <FooterNav />
    </Layout>
  );
}
