import Header from "../components/Header";
import FooterNav from "../components/FooterNav";
import styles from "../styles/pages/saibaMais.module.css";

export default function SaibaMais() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <span>Privacidade e Segurança</span>
          <h1>Saiba mais sobre seus direitos</h1>
          <p>
            Entenda como o Arcanjo trata dados, protege informações e respeita
            seus direitos conforme a LGPD.
          </p>
        </section>

        <section className={styles.card}>
          <h2>O que é a LGPD?</h2>
          <p>
            A Lei Geral de Proteção de Dados Pessoais regula o uso de dados
            pessoais no Brasil. Ela garante ao titular direitos como acesso,
            correção, eliminação, portabilidade, revogação de consentimento e
            informação sobre o tratamento dos seus dados.
          </p>
        </section>

        <section className={styles.grid}>
          <div>
            <h3>Seus direitos</h3>
            <ul>
              <li>Confirmar se tratamos seus dados.</li>
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar exclusão, anonimização ou bloqueio.</li>
              <li>Revogar consentimentos.</li>
              <li>Solicitar portabilidade dos dados.</li>
            </ul>
          </div>

          <div>
            <h3>Dados que podemos usar</h3>
            <ul>
              <li>Nome de usuário e dados de perfil.</li>
              <li>Projetos publicados.</li>
              <li>Comentários, curtidas e salvos.</li>
              <li>Mensagens e notificações.</li>
              <li>Dados técnicos básicos de segurança.</li>
            </ul>
          </div>

          <div>
            <h3>Finalidade</h3>
            <ul>
              <li>Permitir uso da rede social.</li>
              <li>Exibir projetos no feed.</li>
              <li>Melhorar a experiência do usuário.</li>
              <li>Proteger contas e evitar abuso.</li>
              <li>Cumprir obrigações legais.</li>
            </ul>
          </div>

          <div>
            <h3>Segurança</h3>
            <ul>
              <li>Uso de autenticação para proteger contas.</li>
              <li>Controle de acesso às informações.</li>
              <li>Boas práticas no armazenamento de dados.</li>
              <li>Monitoramento contra uso indevido.</li>
            </ul>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Como solicitar seus direitos?</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados
            entrando em contato pelo canal oficial do projeto.
          </p>

          <div className={styles.contactBox}>
            <strong>E-mail de contato:</strong>
            <span>suporte@arcanjo.com</span>
          </div>
        </section>

        <section className={styles.warning}>
          <h2>Aviso importante</h2>
          <p>
            Esta página é um modelo inicial de transparência e privacidade para
            o projeto. Para uso comercial oficial, revise este conteúdo com um
            profissional jurídico.
          </p>
        </section>
      </main>

      <FooterNav />
    </div>
  );
}