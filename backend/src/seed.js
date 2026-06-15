import * as userRepo from './repositories/UserRepository.js';
import * as projectRepo from './repositories/ProjectRepository.js';
import * as storyRepo from './repositories/StoryRepository.js';
import * as followRepo from './repositories/FollowRepository.js';
import * as likeRepo from './repositories/LikeRepository.js';
import * as commentRepo from './repositories/CommentRepository.js';
import * as messageRepo from './repositories/MessageRepository.js';
import * as notificationRepo from './repositories/NotificationRepository.js';
import { initializeDatabase } from './config/db.js';
import { hashPassword } from './utils/hash.js';

const DEFAULT_PASSWORD = '12345678910';

const seedUsers = [
  {
    username: 'luna.dev',
    full_name: 'Luna Carvalho',
    email: 'luna@arcanjo.com',
    bio: 'Designer de experiência com paixão por produtos humanos.',
    avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    banner_url: 'https://picsum.photos/seed/luna/1200/400',
    project: {
      title: 'Rede de eventos criativos',
      description: 'Uma plataforma para conectar criadores a eventos e workshops.',
      category: 'Design',
      tags: ['design', 'eventos', 'criatividade'],
      image_url: 'https://picsum.photos/seed/project1/800/600',
      link: 'https://arcanjo.com/luna-eventos',
    },
    story: {
      content: 'Planejando um novo evento para a comunidade UX.',
      image_url: 'https://picsum.photos/seed/story1/800/1200',
    },
  },
  {
    username: 'bruno.code',
    full_name: 'Bruno Azevedo',
    email: 'bruno@arcanjo.com',
    bio: 'Dev full-stack que ama construir produtos com impacto.',
    avatar_url: 'https://randomuser.me/api/portraits/men/56.jpg',
    banner_url: 'https://picsum.photos/seed/bruno/1200/400',
    project: {
      title: 'Planner financeiro pessoal',
      description: 'Um app simples para organizar receitas e despesas.',
      category: 'Financeiro',
      tags: ['fintech', 'produtividade', 'financeiro'],
      image_url: 'https://picsum.photos/seed/project2/800/600',
      link: 'https://arcanjo.com/bruno-finance',
    },
    story: {
      content: 'Lançando uma nova funcionalidade de metas financeiras.',
      image_url: 'https://picsum.photos/seed/story2/800/1200',
    },
  },
  {
    username: 'camila.art',
    full_name: 'Camila Martins',
    email: 'camila@arcanjo.com',
    bio: 'Artista digital e ilustradora de histórias.',
    avatar_url: 'https://randomuser.me/api/portraits/women/65.jpg',
    banner_url: 'https://picsum.photos/seed/camila/1200/400',
    project: {
      title: 'Coleção de ilustrações animadas',
      description: 'Um portfólio com ilustrações para marcas e startups.',
      category: 'Arte',
      tags: ['arte', 'ilustração', 'branding'],
      image_url: 'https://picsum.photos/seed/project3/800/600',
      link: 'https://arcanjo.com/camila-arte',
    },
    story: {
      content: 'Mostrando meu processo de ilustração para a semana.',
      image_url: 'https://picsum.photos/seed/story3/800/1200',
    },
  },
  {
    username: 'diego.tech',
    full_name: 'Diego Ferreira',
    email: 'diego@arcanjo.com',
    bio: 'Engenheiro de software focado em APIs e automação.',
    avatar_url: 'https://randomuser.me/api/portraits/men/28.jpg',
    banner_url: 'https://picsum.photos/seed/diego/1200/400',
    project: {
      title: 'Agenda de Meetup Dev',
      description: 'Ferramenta para organizar meetups e grupos de estudo.',
      category: 'Tecnologia',
      tags: ['dev', 'meetup', 'backend'],
      image_url: 'https://picsum.photos/seed/project4/800/600',
      link: 'https://arcanjo.com/diego-meetup',
    },
    story: {
      content: 'Convidando a comunidade para nosso próximo meetup.',
      image_url: 'https://picsum.photos/seed/story4/800/1200',
    },
  },
  {
    username: 'elisa.music',
    full_name: 'Elisa Souza',
    email: 'elisa@arcanjo.com',
    bio: 'Música e tecnologia se encontram nos meus projetos.',
    avatar_url: 'https://randomuser.me/api/portraits/women/12.jpg',
    banner_url: 'https://picsum.photos/seed/elisa/1200/400',
    project: {
      title: 'App de playlists colaborativas',
      description: 'Uma rede social para criar playlists em equipe.',
      category: 'Música',
      tags: ['música', 'social', 'colaboração'],
      image_url: 'https://picsum.photos/seed/project5/800/600',
      link: 'https://arcanjo.com/elisa-playlists',
    },
    story: {
      content: 'Testando uma integração com novas trilhas sonoras.',
      image_url: 'https://picsum.photos/seed/story5/800/1200',
    },
  },
  {
    username: 'felipe.gamer',
    full_name: 'Felipe Lima',
    email: 'felipe@arcanjo.com',
    bio: 'Criador de experiências imersivas e jogos indie.',
    avatar_url: 'https://randomuser.me/api/portraits/men/33.jpg',
    banner_url: 'https://picsum.photos/seed/felipe/1200/400',
    project: {
      title: 'Mini game educativo',
      description: 'Um jogo para aprender lógica de forma divertida.',
      category: 'Jogos',
      tags: ['gaming', 'educação', 'indie'],
      image_url: 'https://picsum.photos/seed/project6/800/600',
      link: 'https://arcanjo.com/felipe-game',
    },
    story: {
      content: 'Lançando uma demo do jogo nesta semana.',
      image_url: 'https://picsum.photos/seed/story6/800/1200',
    },
  },
  {
    username: 'gabriela.bio',
    full_name: 'Gabriela Costa',
    email: 'gabriela@arcanjo.com',
    bio: 'Bióloga e entusiasta de projetos sustentáveis.',
    avatar_url: 'https://randomuser.me/api/portraits/women/47.jpg',
    banner_url: 'https://picsum.photos/seed/gabriela/1200/400',
    project: {
      title: 'Mapa de ações sustentáveis',
      description: 'Uma plataforma para mapear iniciativas ambientais locais.',
      category: 'Sustentabilidade',
      tags: ['meio ambiente', 'sustentabilidade', 'comunidade'],
      image_url: 'https://picsum.photos/seed/project7/800/600',
      link: 'https://arcanjo.com/gabriela-sustentavel',
    },
    story: {
      content: 'Compartilhando novas iniciativas para a semana.',
      image_url: 'https://picsum.photos/seed/story7/800/1200',
    },
  },
  {
    username: 'hugo.ux',
    full_name: 'Hugo Pereira',
    email: 'hugo@arcanjo.com',
    bio: 'UX researcher apaixonado por usabilidade e acessibilidade.',
    avatar_url: 'https://randomuser.me/api/portraits/men/39.jpg',
    banner_url: 'https://picsum.photos/seed/hugo/1200/400',
    project: {
      title: 'Kit de acessibilidade digital',
      description: 'Recursos para tornar interfaces mais inclusivas.',
      category: 'UX',
      tags: ['acessibilidade', 'UX', 'design'],
      image_url: 'https://picsum.photos/seed/project8/800/600',
      link: 'https://arcanjo.com/hugo-ux',
    },
    story: {
      content: 'Revisando padrões de acessibilidade para meu novo projeto.',
      image_url: 'https://picsum.photos/seed/story8/800/1200',
    },
  },
  {
    username: 'isabela.photo',
    full_name: 'Isabela Ribeiro',
    email: 'isabela@arcanjo.com',
    bio: 'Fotógrafa e criadora de memórias visuais.',
    avatar_url: 'https://randomuser.me/api/portraits/women/51.jpg',
    banner_url: 'https://picsum.photos/seed/isabela/1200/400',
    project: {
      title: 'Galeria foto-jornalística',
      description: 'Histórias visuais de comunidades e eventos locais.',
      category: 'Fotografia',
      tags: ['foto', 'jornalismo', 'história'],
      image_url: 'https://picsum.photos/seed/project9/800/600',
      link: 'https://arcanjo.com/isabela-fotos',
    },
    story: {
      content: 'Preview de uma sessão fotográfica ao ar livre.',
      image_url: 'https://picsum.photos/seed/story9/800/1200',
    },
  },
  {
    username: 'joao.data',
    full_name: 'João Silva',
    email: 'joao@arcanjo.com',
    bio: 'Analista de dados que transforma números em histórias.',
    avatar_url: 'https://randomuser.me/api/portraits/men/10.jpg',
    banner_url: 'https://picsum.photos/seed/joao/1200/400',
    project: {
      title: 'Painel interativo de métricas',
      description: 'Dashboard para acompanhar o crescimento de projetos.',
      category: 'Dados',
      tags: ['data', 'dashboard', 'analytics'],
      image_url: 'https://picsum.photos/seed/project10/800/600',
      link: 'https://arcanjo.com/joao-dados',
    },
    story: {
      content: 'Mostrando insights recentes de análise de dados.',
      image_url: 'https://picsum.photos/seed/story10/800/1200',
    },
  },
  {
    username: 'karina.social',
    full_name: 'Karina Lima',
    email: 'karina@arcanjo.com',
    bio: 'Comunicação e redes sociais com criatividade.',
    avatar_url: 'https://randomuser.me/api/portraits/women/42.jpg',
    banner_url: 'https://picsum.photos/seed/karina/1200/400',
    project: {
      title: 'Guia de conteúdo para criadores',
      description: 'Templates e dicas para construir um feed impactante.',
      category: 'Marketing',
      tags: ['social', 'conteúdo', 'marketing'],
      image_url: 'https://picsum.photos/seed/project11/800/600',
      link: 'https://arcanjo.com/karina-marketing',
    },
    story: {
      content: 'Criando novas ideias para o meu próximo post.',
      image_url: 'https://picsum.photos/seed/story11/800/1200',
    },
  },
  {
    username: 'lucas.saas',
    full_name: 'Lucas Ramos',
    email: 'lucas@arcanjo.com',
    bio: 'Empreendedor construindo produtos SaaS escaláveis.',
    avatar_url: 'https://randomuser.me/api/portraits/men/5.jpg',
    banner_url: 'https://picsum.photos/seed/lucas/1200/400',
    project: {
      title: 'Ferramenta de gestão de tarefas',
      description: 'Uma solução simples para equipes se organizarem.',
      category: 'Produtividade',
      tags: ['saas', 'produtividade', 'gestão'],
      image_url: 'https://picsum.photos/seed/project12/800/600',
      link: 'https://arcanjo.com/lucas-tarefas',
    },
    story: {
      content: 'Lançando nova versão com integração de calendário.',
      image_url: 'https://picsum.photos/seed/story12/800/1200',
    },
  },
  {
    username: 'mariana.video',
    full_name: 'Mariana Gomes',
    email: 'mariana@arcanjo.com',
    bio: 'Criadora de vídeos e conteúdo audiovisual.',
    avatar_url: 'https://randomuser.me/api/portraits/women/15.jpg',
    banner_url: 'https://picsum.photos/seed/mariana/1200/400',
    project: {
      title: 'Biblioteca de roteiros curtos',
      description: 'Modelos de roteiros para criadores de conteúdo.',
      category: 'Vídeo',
      tags: ['vídeo', 'roteiro', 'conteúdo'],
      image_url: 'https://picsum.photos/seed/project13/800/600',
      link: 'https://arcanjo.com/mariana-video',
    },
    story: {
      content: 'Mostrando backstage da produção do meu último vídeo.',
      image_url: 'https://picsum.photos/seed/story13/800/1200',
    },
  },
  {
    username: 'nicolas.sound',
    full_name: 'Nicolas Mendes',
    email: 'nicolas@arcanjo.com',
    bio: 'Produtor de áudio e curador de sound design.',
    avatar_url: 'https://randomuser.me/api/portraits/men/60.jpg',
    banner_url: 'https://picsum.photos/seed/nicolas/1200/400',
    project: {
      title: 'Banco de trilhas sonoras',
      description: 'Um repositório de áudios livres para criadores.',
      category: 'Áudio',
      tags: ['audio', 'sound', 'música'],
      image_url: 'https://picsum.photos/seed/project14/800/600',
      link: 'https://arcanjo.com/nicolas-audio',
    },
    story: {
      content: 'Criando trilhas sonoras para projetos visuais.',
      image_url: 'https://picsum.photos/seed/story14/800/1200',
    },
  },
  {
    username: 'olivia.coder',
    full_name: 'Olívia Fernandes',
    email: 'olivia@arcanjo.com',
    bio: 'Engenheira de software com foco em acessibilidade.',
    avatar_url: 'https://randomuser.me/api/portraits/women/8.jpg',
    banner_url: 'https://picsum.photos/seed/olivia/1200/400',
    project: {
      title: 'Template acessível para landing pages',
      description: 'Componentes prontos para sites inclusivos.',
      category: 'Front-end',
      tags: ['acessibilidade', 'frontend', 'templates'],
      image_url: 'https://picsum.photos/seed/project15/800/600',
      link: 'https://arcanjo.com/olivia-landing',
    },
    story: {
      content: 'Dicas rápidas para deixar páginas mais acessíveis.',
      image_url: 'https://picsum.photos/seed/story15/800/1200',
    },
  },
  {
    username: 'paulo.mentor',
    full_name: 'Paulo Nunes',
    email: 'paulo@arcanjo.com',
    bio: 'Mentor de tecnologia e liderança para times criativos.',
    avatar_url: 'https://randomuser.me/api/portraits/men/75.jpg',
    banner_url: 'https://picsum.photos/seed/paulo/1200/400',
    project: {
      title: 'Guia de carreira para devs',
      description: 'Material para quem quer crescer na área de tecnologia.',
      category: 'Carreira',
      tags: ['carreira', 'mentoria', 'tecnologia'],
      image_url: 'https://picsum.photos/seed/project16/800/600',
      link: 'https://arcanjo.com/paulo-carreira',
    },
    story: {
      content: 'Compartilhando meu conselho para entrevistas técnicas.',
      image_url: 'https://picsum.photos/seed/story16/800/1200',
    },
  },
  {
    username: 'rafaela.cook',
    full_name: 'Rafaela Dias',
    email: 'rafaela@arcanjo.com',
    bio: 'Cozinheira e criadora que mistura tecnologia e gastronomia.',
    avatar_url: 'https://randomuser.me/api/portraits/women/29.jpg',
    banner_url: 'https://picsum.photos/seed/rafaela/1200/400',
    project: {
      title: 'Receitas digitais colaborativas',
      description: 'Plataforma para compartilhar receitas em vídeo.',
      category: 'Culinária',
      tags: ['culinária', 'receitas', 'colaboração'],
      image_url: 'https://picsum.photos/seed/project17/800/600',
      link: 'https://arcanjo.com/rafaela-cozinha',
    },
    story: {
      content: 'Experimentando uma receita nova com ingredientes locais.',
      image_url: 'https://picsum.photos/seed/story17/800/1200',
    },
  },
  {
    username: 'samuel.sports',
    full_name: 'Samuel Torres',
    email: 'samuel@arcanjo.com',
    bio: 'Criador de conteúdo esportivo e estilo de vida ativo.',
    avatar_url: 'https://randomuser.me/api/portraits/men/82.jpg',
    banner_url: 'https://picsum.photos/seed/samuel/1200/400',
    project: {
      title: 'Clube virtual de treinos',
      description: 'Espaço para compartilhar treinos e metas semanais.',
      category: 'Esporte',
      tags: ['fitness', 'treino', 'saúde'],
      image_url: 'https://picsum.photos/seed/project18/800/600',
      link: 'https://arcanjo.com/samuel-treino',
    },
    story: {
      content: 'Mostrando a rotina de treino de hoje.',
      image_url: 'https://picsum.photos/seed/story18/800/1200',
    },
  },
  {
    username: 'tais.writer',
    full_name: 'Taís Almeida',
    email: 'tais@arcanjo.com',
    bio: 'Escritora e contadora de narrativas digitais.',
    avatar_url: 'https://randomuser.me/api/portraits/women/91.jpg',
    banner_url: 'https://picsum.photos/seed/tais/1200/400',
    project: {
      title: 'Coleção de microcontos',
      description: 'Textos rápidos com ilustrações para redes sociais.',
      category: 'Literatura',
      tags: ['escrita', 'histórias', 'criatividade'],
      image_url: 'https://picsum.photos/seed/project19/800/600',
      link: 'https://arcanjo.com/tais-textos',
    },
    story: {
      content: 'Novo microconto para inspirar seu dia.',
      image_url: 'https://picsum.photos/seed/story19/800/1200',
    },
  },
  {
    username: 'victor.growth',
    full_name: 'Victor Santos',
    email: 'victor@arcanjo.com',
    bio: 'Especialista em crescimento e performance digital.',
    avatar_url: 'https://randomuser.me/api/portraits/men/46.jpg',
    banner_url: 'https://picsum.photos/seed/victor/1200/400',
    project: {
      title: 'Toolkit para crescimento de startups',
      description: 'Recursos e checklists para times escalarem com foco.',
      category: 'Negócios',
      tags: ['startup', 'growth', 'negócios'],
      image_url: 'https://picsum.photos/seed/project20/800/600',
      link: 'https://arcanjo.com/victor-growth',
    },
    story: {
      content: 'Compartilhando táticas de crescimento para a próxima semana.',
      image_url: 'https://picsum.photos/seed/story20/800/1200',
    },
  },
];

function addHours(hours) {
  return new Date(Date.now() + Math.max(1, hours) * 60 * 60 * 1000).toISOString();
}

const seedPublicationTypes = [
  'projeto',
  'ideia',
  'prototipo',
  'design',
  'codigo',
  'print',
  'video-curto',
  'atualizacao',
  'bug-corrigido',
  'antes-e-depois',
  'pedido-feedback',
  'vaga-freela',
];

export async function seedDatabase() {
  await initializeDatabase();

  const existingUsers = await userRepo.getAll(1, 0);
  if (existingUsers && existingUsers.length > 0) {
    console.log('⚠️  Já existem usuários no banco. Seed não será executado.');
    return false;
  }

  console.log('🌱 Iniciando seed de dados do backend...');

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
  const createdUsers = [];
  const createdProjects = [];

  for (const [index, profile] of seedUsers.entries()) {
    const user = await userRepo.create({
      username: profile.username,
      password: hashedPassword,
      email: profile.email,
      full_name: profile.full_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url,
      is_private: false,
      is_bot: true,
      selos: JSON.stringify([{ symbol: '🤖', label: 'Bot da comunidade' }]),
      badges: JSON.stringify([{ symbol: '🤖', label: 'Bot da comunidade' }]),
    });

    const project = await projectRepo.create({
      title: profile.project.title,
      description: profile.project.description,
      user_id: user.id,
      image_url: profile.project.image_url,
      category: profile.project.category,
      post_type: seedPublicationTypes[index % seedPublicationTypes.length],
      tags: JSON.stringify(profile.project.tags),
      link: profile.project.link,
    });

    await storyRepo.create({
      user_id: user.id,
      image_url: profile.story.image_url,
      content: profile.story.content,
      expires_at: addHours(20),
    });

    createdUsers.push(user);
    createdProjects.push(project);
  }

  // Conectar usuários entre si e garantir seguidores únicos por usuário
  for (let followingIndex = 0; followingIndex < createdUsers.length; followingIndex += 1) {
    const followingUser = createdUsers[followingIndex];

    for (let followerIndex = 0; followerIndex < followingIndex; followerIndex += 1) {
      const followerUser = createdUsers[followerIndex];
      await followRepo.create(followerUser.id, followingUser.id);
      await notificationRepo.create({
        user_id: followingUser.id,
        from_user_id: followerUser.id,
        type: 'follow',
        message: `${followerUser.full_name} começou a seguir você.`,
      });
    }
  }

  // Curtidas, comentários e mensagens
  for (let index = 0; index < createdUsers.length; index += 1) {
    const user = createdUsers[index];
    const firstProject = createdProjects[(index + 1) % createdProjects.length];
    const secondProject = createdProjects[(index + 2) % createdProjects.length];

    await likeRepo.create(user.id, firstProject.id);
    await likeRepo.create(user.id, secondProject.id);

    firstProject.likes_count = (firstProject.likes_count || 0) + 1;
    secondProject.likes_count = (secondProject.likes_count || 0) + 1;
    await projectRepo.save(firstProject);
    await projectRepo.save(secondProject);

    const commentUser = createdUsers[(index + 3) % createdUsers.length];
    await commentRepo.create({
      content: `Adorei seu projeto "${firstProject.title}"!`,
      user_id: commentUser.id,
      project_id: firstProject.id,
    });
    firstProject.comments_count = (firstProject.comments_count || 0) + 1;
    await projectRepo.save(firstProject);

    await notificationRepo.create({
      user_id: firstProject.user_id,
      from_user_id: user.id,
      type: 'like',
      project_id: firstProject.id,
      message: `${user.full_name} curtiu seu projeto "${firstProject.title}".`,
    });

    await notificationRepo.create({
      user_id: firstProject.user_id,
      from_user_id: commentUser.id,
      type: 'comment',
      project_id: firstProject.id,
      message: `${commentUser.full_name} comentou no seu projeto.`,
    });

    const receiver = createdUsers[(index + 1) % createdUsers.length];
    await messageRepo.create({
      sender_id: user.id,
      receiver_id: receiver.id,
      content: `Olá ${receiver.full_name}, adorei seu projeto "${secondProject.title}"! Vamos trocar ideias?`,
    });
    await notificationRepo.create({
      user_id: receiver.id,
      from_user_id: user.id,
      type: 'message',
      message: `${user.full_name} enviou uma mensagem para você.`,
    });
  }

  console.log(`✅ Seed concluída: ${createdUsers.length} usuários criados.`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro ao rodar seed:', error);
      process.exit(1);
    });
}
