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
