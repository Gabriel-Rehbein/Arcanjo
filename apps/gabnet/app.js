const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const results = document.getElementById('results');
const cardTpl = document.getElementById('cardTpl').content;

async function search(q){
  results.innerHTML = '';
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if(!res.ok) return alert('Erro na busca');
  const data = await res.json();
  if(!data.results || data.results.length === 0){
    results.innerHTML = `<p style="padding:18px;color:#c6d2df">Nenhum resultado</p>`;
    return;
  }
  data.results.forEach(item => {
    const el = cardTpl.cloneNode(true);
    el.querySelector('.poster').src = item.poster || '';
    el.querySelector('.title').textContent = `${item.title} (${item.year || ''})`;
    el.querySelector('.meta').textContent = `${item.vote_average ? '⭐ '+item.vote_average+' – ' : ''}${item.genres?.slice(0,3).join(', ') || ''}`;
    const platforms = el.querySelector('.platforms');
    (item.availability || []).slice(0,4).forEach(p=>{
      const b = document.createElement('span');
      b.className='plat';
      b.textContent = p; // nome simples da plataforma
      platforms.appendChild(b);
    });
    el.querySelector('.card').addEventListener('click', ()=> window.location.href = `/title.html?id=${item.id}`); // se criar página de detalhes
    results.appendChild(el);
  });
}

searchBtn.addEventListener('click', ()=> {
  const q = searchInput.value.trim();
  if(!q) return;
  search(q);
});
searchInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') searchBtn.click(); });
