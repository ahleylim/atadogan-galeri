// Sayfa tamamen yüklendiğinde bu fonksiyonu çalıştır
document.addEventListener("DOMContentLoaded", function() {

    // ----------- BAŞLANGIÇ: BURAYI KESİNLİKLE DÜZENLEYİN ----------- //

    // 1. GitHub Kullanıcı Adınız (Tırnak içinde, Örn: "ahleylim")
    const githubUsername = "ahleylim"; 

    // 2. Bu kodları yüklediğiniz Repository (Repo) Adı (Tırnak içinde, Örn: "galeri-sitem")
    const githubRepo = "atadogan-galeri"; 

    // 3. Resimlerin bulunduğu klasörün adı.
    const imageFolderPath = "resimler"; 

    // ----------- BİTİŞ: DÜZENLEME ALANI SONU ----------- //

    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${imageFolderPath}`;

    // HTML elemanlarını seç
    const galleryContainer = document.getElementById("gallery-container");
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImage = document.getElementById("lightbox-image");
    const closeBtn = document.querySelector(".lightbox-close");
    const downloadBtn = document.getElementById("download-button");

    // Zoom ve Pan (Sürükleme) için elemanları ve değişkenleri seç
    const zoomInBtn = document.getElementById("zoom-in-btn");
    const zoomOutBtn = document.getElementById("zoom-out-btn");
    
    let currentScale = 1;
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    // --- GitHub'dan Veri Çekme ---
    fetch(apiUrl)
        .then(response => {
            if (response.status === 404) throw new Error(`'${imageFolderPath}' klasörü bulunamadı. Lütfen reponuzda bu klasörü oluşturduğunuzdan emin olun.`);
            if (!response.ok) throw new Error("GitHub API'den veriler alınamadı. Kullanıcı adı ve repo adını kontrol edin.");
            return response.json();
        })
        .then(data => {
            const imageFiles = data.filter(file => 
                file.type === "file" && /\.(jpe?g|png|gif|webp)$/i.test(file.name)
            );
            
            if (imageFiles.length === 0) {
                galleryContainer.innerHTML = `<p style="color: #ccc;">'${imageFolderPath}' klasöründe hiç resim bulunamadı. Lütfen resim yükleyin.</p>`;
                return;
            }

            imageFiles.forEach(file => {
                const img = document.createElement("img");
                img.src = file.download_url; // Galeri thumbnail'ı (hızlı yüklenir)
                img.alt = file.name;
                
                // Tıklandığında lightbox'ı aç (Doğru indirme linki için file.path kullan)
                img.addEventListener("click", () => {
                    openLightbox(file.download_url, file.path); 
                });
                galleryContainer.appendChild(img);
            });
        })
        .catch(error => {
            console.error("Hata:", error);
            galleryContainer.innerHTML = `<p style="color: #f00;">Galeri yüklenirken bir hata oluştu: ${error.message}</p>`;
        });

    // --- Lightbox Fonksiyonları ---

    // Resim transformasyonunu (scale, translate) uygular
    function updateImageTransform() {
        lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }

    // Lightbox'ı açar ve tüm ayarları sıfırlar
    function openLightbox(imageUrl, imagePath) {
        lightboxImage.src = imageUrl; 
        downloadBtn.href = imagePath; // Doğru indirme linki (örn: "resimler/foto.jpg")
        const imageName = imagePath.split('/').pop();
        downloadBtn.download = imageName; 
        
        // Zoom ve Pan ayarlarını sıfırla
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        lightboxImage.classList.remove("can-drag", "is-dragging"); // İmleçleri sıfırla

        lightbox.style.display = "flex";
    }

    // Lightbox'ı kapatır ve ayarları sıfırlar
    function closeLightbox() {
        lightbox.style.display = "none";
        // Ayarları sıfırla (açarken de yapılıyor ama garanti olsun)
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        lightboxImage.classList.remove("can-drag", "is-dragging");
    }

    // Kapatma tuşları
    closeBtn.addEventListener("click", closeLightbox);
    
    lightbox.addEventListener("click", function(event) {
        // Eğer tıklanan yer resim, indirme tuşu veya zoom tuşu değilse kapat
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // --- Zoom (Yakınlaştırma) Eventleri ---

    zoomInBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Lightbox'ın (arka planın) tıklanmasını engelle
        currentScale += 0.2; // Yakınlaştırma miktarını artır
        updateImageTransform();
        lightboxImage.classList.add("can-drag"); // Sürükleme imlecini aktif et
    });

    zoomOutBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Lightbox'ın (arka planın) tıklanmasını engelle
        if (currentScale > 1) { // Minumum 1x zoom
            currentScale = Math.max(1, currentScale - 0.2); // 1'in altına düşmesini engelle
        }
        
        if (currentScale === 1) {
            // Eğer 1x'e dönüldüyse, sürüklemeyi sıfırla ve ortala
            translateX = 0;
            translateY = 0;
            lightboxImage.classList.remove("can-drag", "is-dragging");
        }
        updateImageTransform();
    });

    // --- Pan (Sürükleme) Eventleri ---

    lightboxImage.addEventListener("mousedown", (e) => {
        if (currentScale <= 1) return; // Sadece yakınlaştırılmışsa sürükle
        e.preventDefault(); // Resim sürükleme gibi varsayılanları engelle
        
        isDragging = true;
        startX = e.pageX - translateX;
        startY = e.pageY - translateY;
        lightboxImage.classList.add("is-dragging"); // "Tutuyor" imlecini göster
    });

    // Fare hareketlerini lightbox'ın tamamında dinle
    // (Bu sayede imleç resmin dışına çıksa bile sürükleme devam eder)
    lightbox.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        translateX = e.pageX - startX;
        translateY = e.pageY - translateY;
        updateImageTransform();
    });

    // Sürüklemeyi bırakma
    lightbox.addEventListener("mouseup", () => {
        isDragging = false;
        lightboxImage.classList.remove("is-dragging"); // "Tutuyor" imlecini kaldır
    });
    
    // İmleç lightbox'tan çıkarsa da sürüklemeyi bırak
    lightbox.addEventListener("mouseleave", () => {
        isDragging = false;
        lightboxImage.classList.remove("is-dragging");
    });

});

