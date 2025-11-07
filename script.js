// Sayfa tamamen yüklendiğinde bu fonksiyonu çalıştır
document.addEventListener("DOMContentLoaded", function() {

    // ----------- BAŞLANGIÇ: BURAYI KESİNLİKLE DÜZENLEYİN ----------- //

    // 1. GitHub Kullanıcı Adınız (Tırnak içinde, Örn: "ataberkdogan")
    const githubUsername = "ahleylim"; 

    // 2. Bu kodları yüklediğiniz Repository (Repo) Adı (Tırnak içinde, Örn: "galeri-sitem")
    const githubRepo = "atadogan-galeri"; 

    // 3. Resimlerin bulunduğu klasörün adı.
    const imageFolderPath = "resimler"; 

    // ----------- BİTİŞ: DÜZENLEME ALANI SONU ----------- //


    // GitHub API'sine bağlanmak için oluşturulan URL
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${imageFolderPath}`;

    // HTML'deki elemanları seçip değişkenlere ata
    const galleryContainer = document.getElementById("gallery-container");
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImage = document.getElementById("lightbox-image");
    const closeBtn = document.querySelector(".lightbox-close");
    const downloadBtn = document.getElementById("download-button");

    // GitHub API'sinden 'resimler' klasörünün içeriğini çekme
    fetch(apiUrl)
        .then(response => {
            if (response.status === 404) {
                throw new Error(`'${imageFolderPath}' klasörü bulunamadı. Lütfen reponuzda bu klasörü oluşturduğunuzdan emin olun.`);
            }
            if (!response.ok) {
                throw new Error("GitHub API'den veriler alınamadı. Kullanıcı adı ve repo adını kontrol edin.");
            }
            return response.json();
        })
        .then(data => {
            const imageFiles = data.filter(file => 
                file.type === "file" &&
                /\.(jpe?g|png|gif|webp)$/i.test(file.name)
            );
            
            if (imageFiles.length === 0) {
                galleryContainer.innerHTML = `<p style="color: #ccc;">'${imageFolderPath}' klasöründe hiç resim bulunamadı. Lütfen resim yükleyin.</p>`;
                return;
            }

            // Bulunan her resim dosyası için galeriye bir <img> elementi ekle
            imageFiles.forEach(file => {
                const img = document.createElement("img");
                img.src = file.download_url;
                img.alt = file.name;

                // Tıklandığında lightbox'ı aç
                img.addEventListener("click", () => {
                    // Resmin URL'sini VE ADINI openLightbox fonksiyonuna gönder
                    openLightbox(file.download_url, file.name);
                });

                galleryContainer.appendChild(img);
            });
        })
        .catch(error => {
            console.error("Hata:", error);
            galleryContainer.innerHTML = `<p style="color: #f00;">Galeri yüklenirken bir hata oluştu: ${error.message}</p>`;
        });

    // Lightbox'ı açan fonksiyon
    function openLightbox(imageUrl, imageName) {
        lightboxImage.src = imageUrl; 
        downloadBtn.href = imageUrl; 
        
        // ÖNEMLİ: İNDİRME TUŞU İŞLEVİ
        // Bu satır, indirme tuşuna basıldığında dosyanın orijinal adıyla
        // (örn: "foto1.jpg") indirilmesini sağlar.
        downloadBtn.download = imageName; 
        
        lightbox.style.display = "flex";
    }

    // Lightbox'ı kapatan fonksiyon
    function closeLightbox() {
        lightbox.style.display = "none";
    }

    // Kapatma tuşuna basınca kapat
    closeBtn.addEventListener("click", closeLightbox);

    // Dışarıya tıklayınca kapat
    lightbox.addEventListener("click", function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

});
