const categories = ['ataberk','murat'];
let allPhotos = [];

async function loadPhotos(){
  allPhotos = [];
  for(const cat of categories){
    for(let i=1;; i++){
      const path = `images/${cat}/${i}.jpg`;
      try {
        const res = await fetch(path);
        if(!res.ok) break;
        allPhotos.push({ path, category: cat });
      } catch { break; }
    }
  }
  displayPhotos(allPhotos);
  setupFilters();
}

function displayPhotos(photos){
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = photos.map(p=>`
    <div class="photo-card" onclick="openModal('${p.path}','${p.category}')">
      <img src="${p.path}" alt="${p.category}">
      <div class="category-label">${p.category}</div>
    </div>
  `).join('');
}

function setupFilters(){
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      const filtered = cat==='all' ? allPhotos : allPhotos.filter(p=>p.category===cat);
      displayPhotos(filtered);
    };
  });
}

function openModal(path,cat){
  const modal = document.getElementById('photo-modal');
  const img = document.getElementById('modal-img');
  const download = document.getElementById('download-btn');
  img.src = path;
  download.href = path;
  modal.classList.remove('hidden');
}
function closeModal(){ document.getElementById('photo-modal').classList.add('hidden'); }

document.addEventListener("DOMContentLoaded", () => {
  loadPhotos();
  setTimeout(() => {
    const loading = document.getElementById("loading-screen");
    if (loading) loading.style.display = "none";
  }, 2500);
});
