// 🧩 Basit Admin Panel Sistemi – Ataberk Doğan Galerisi

const ADMIN_PASSWORD = "ataberk123";
const categories = ["ataberk", "murat"];
let allPhotos = [];
let currentCategory = "all";
let hiddenCategories = JSON.parse(localStorage.getItem("hiddenCategories") || "[]");

// 🧠 Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  if (loggedIn === "true") showAdminPanel();

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  setupCategoryFilters();
  setupHideButtons();
});

// 🔐 Giriş kontrolü
function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("login-error");

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem("loggedIn", "true");
    errorDiv.classList.add("hidden");
    showAdminPanel();
  } else {
    errorDiv.textContent = "❌ Yanlış şifre!";
    errorDiv.classList.remove("hidden");
  }
}

// 🚪 Çıkış işlemi
function handleLogout() {
  sessionStorage.removeItem("loggedIn");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

// 🖼️ Fotoğrafları yükle
async function loadPhotos() {
  const grid = document.getElementById("admin-grid");
  const loading = document.getElementById("admin-loading");
  grid.innerHTML = "";
  loading.classList.remove("hidden");

  allPhotos = [];
  for (const cat of categories) {
    for (let i = 1; ; i++) {
      const path = `images/${cat}/${i}.jpg`;
      try {
        const res = await fetch(path);
        if (!res.ok) break;
        allPhotos.push({ path, category: cat });
      } catch {
        break;
      }
    }
  }

  loading.classList.add("hidden");
  displayPhotos();
}

// 📸 Fotoğrafları ekrana bas
function displayPhotos() {
  const grid = document.getElementById("admin-grid");
  let filtered = allPhotos;

  if (currentCategory !== "all") {
    filtered = allPhotos.filter((p) => p.category === currentCategory);
  }

  grid.innerHTML = filtered
    .map((p) => {
      const isHidden = hiddenCategories.includes(p.category);
      return `
        <div class="photo-card ${isHidden ? "hidden-photo" : ""}">
          <img src="${p.path}" alt="${p.category}">
          <div class="category-label">${p.category}</div>
        </div>
      `;
    })
    .join("");
}

// 🔘 Filtre sistemi
function setupCategoryFilters() {
  document.querySelectorAll(".admin-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".admin-filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      displayPhotos();
    });
  });
}

// 👁️ Kategori gizleme/gösterme sistemi
function setupHideButtons() {
  document.querySelectorAll(".toggle-cat").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      if (hiddenCategories.includes(cat)) {
        hiddenCategories = hiddenCategories.filter((c) => c !== cat);
      } else {
        hiddenCategories.push(cat);
      }
      localStorage.setItem("hiddenCategories", JSON.stringify(hiddenCategories));
      displayPhotos();
    });
  });
}

// 🧭 Paneli göster
function showAdminPanel() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
  loadPhotos();
}
