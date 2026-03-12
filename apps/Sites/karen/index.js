
  function toggleMenu() {
    const menu = document.querySelector('.menu-list');
    const button = document.querySelector('.menu-toggle');

    if (menu.classList.contains('ativo')) {
      menu.classList.remove('ativo');
      button.textContent = '☰';
    } else {
      menu.classList.add('ativo');
      button.textContent = '✖';
    }
  }