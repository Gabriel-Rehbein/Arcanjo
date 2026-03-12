

document.addEventListener('DOMContentLoaded', () => {
  const imagem = document.getElementById('imagemEscritorio');
  const imagens = [
    'Image/Firma/predio.png',
    'Image/Firma/porta.png',
    'Image/Firma/salapordentro.png'
  ];
  let index = 0;
  let intervalo;

  function mostrarImagem(i) {
    imagem.style.opacity = 0;
    setTimeout(() => {
      imagem.src = imagens[i];
      imagem.style.opacity = 1;
    }, 200);
  }

  function proximaImagem() {
    index = (index + 1) % imagens.length;
    mostrarImagem(index);
  }

  function imagemAnterior() {
    index = (index - 1 + imagens.length) % imagens.length;
    mostrarImagem(index);
  }

  document.querySelector('.seta.direita').addEventListener('click', () => {
    proximaImagem();
    reiniciarAutoPlay();
  });

  document.querySelector('.seta.esquerda').addEventListener('click', () => {
    imagemAnterior();
    reiniciarAutoPlay();
  });

  function iniciarAutoPlay() {
    intervalo = setInterval(proximaImagem, 3000);
  }

  function reiniciarAutoPlay() {
    clearInterval(intervalo);
    iniciarAutoPlay();
  }

  iniciarAutoPlay();
});
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navbar = document.getElementById("navbar");

  if (menuToggle && navbar) {
    menuToggle.addEventListener("click", function () {
      navbar.classList.toggle("show");
    });
  }
});
