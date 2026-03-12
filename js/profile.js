// Página de Perfil do Usuário

protectRoute();

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  const currentUserId = Auth.getCurrentUserId();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Carregar dados do perfil
  loadProfileData(currentUser, currentUserId);

  // Listener para salvar
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileData(currentUserId);
  });

  // Listener para compartilhar perfil
  document.getElementById('shareProfileBtn').addEventListener('click', () => {
    shareProfile(currentUser);
  });

  // botão de direct para abrir chat
  const directBtn = document.getElementById('directBtn');
  if (directBtn) {
    directBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('to', currentUserId);
      window.location.href = 'messages.html?' + params.toString();
    });
  }
});

function loadProfileData(username, userId) {
  // Mostrar informações básicas
  document.getElementById('profileUsername').textContent = `👤 ${username}`;
  
  const createdDate = localStorage.getItem(`user_created_${userId}`);
  if (createdDate) {
    const date = new Date(createdDate);
    const formatted = date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('profileMemberSince').textContent = `Membro desde ${formatted}`;
  }

  // Carregar dados salvos
  const profileData = JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}');

  document.getElementById('profileBio').value = profileData.bio || '';
  document.getElementById('profileLocation').value = profileData.location || '';
  document.getElementById('profileOccupation').value = profileData.occupation || '';
  document.getElementById('profileWebsite').value = profileData.website || '';
  document.getElementById('profileGithub').value = profileData.github || '';
  document.getElementById('profileEmail').value = profileData.email || '';
}

function saveProfileData(userId) {
  const profileData = {
    bio: document.getElementById('profileBio').value,
    location: document.getElementById('profileLocation').value,
    occupation: document.getElementById('profileOccupation').value,
    website: document.getElementById('profileWebsite').value,
    github: document.getElementById('profileGithub').value,
    email: document.getElementById('profileEmail').value,
    updated: new Date().toISOString()
  };

  // Validar tamanho da bio
  if (profileData.bio.length > 500) {
    alert('A bio não pode ter mais de 500 caracteres!');
    return;
  }

  localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));

  // Mostrar mensagem de sucesso
  const successMsg = document.getElementById('successMessage');
  successMsg.classList.add('show');
  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);

  console.log('Perfil salvo com sucesso!', profileData);
}

function shareProfile(username) {
  const shareText = `Confira o perfil de ${username} no Arcanjo!`;

  // Verificar se o navegador suporta Web Share API
  if (navigator.share) {
    navigator.share({
      title: 'Perfil no Arcanjo',
      text: shareText,
      url: window.location.href
    }).catch(err => console.log('Erro ao compartilhar:', err));
  } else {
    // Fallback: copiar para clipboard
    const textToCopy = `${shareText} ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showShareSuccess();
    }).catch(err => {
      // Fallback para navegadores mais antigos
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showShareSuccess();
    });
  }
}

function showShareSuccess() {
  const successMsg = document.getElementById('successMessage');
  successMsg.textContent = '📤 Link do perfil copiado para a área de transferência!';
  successMsg.classList.add('show');
  setTimeout(() => {
    successMsg.classList.remove('show');
    successMsg.textContent = '✅ Perfil atualizado com sucesso!';
  }, 3000);
}
