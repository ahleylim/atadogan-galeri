// Sayfa tamamen yüklendiğinde bu fonksiyonu çalıştır
document.addEventListener("DOMContentLoaded", function() {

    // ----------- BAŞLANGIÇ: BURAYI KESİNLİKLE DÜZENLEYİN ----------- //

    // 1. GitHub Kullanıcı Adınız (Tırnak içinde, Örn: "ataberkdogan")
    const githubUsername = "ahleylim"; 

    // 2. Bu kodları yüklediğiniz Repository (Repo) Adı (Tırnak içinde, Örn: "galeri-sitem")
    const githubRepo = "atadogan-galeri"; 

    // 3. Resimlerin bulunduğu klasörün adı. 
    //    Dosya yapısına göre "resimler" olarak bıraktık.
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
            // Eğer klasör bulunamazsa (404) veya başka bir hata varsa
            if (response.status === 404) {
                throw new Error(`'${imageFolderPath}' klasörü bulunamadı. Lütfen reponuzda bu klasörü oluşturduğunuzdan emin olun.`);
            }
            if (!response.ok) {
                throw new Error("GitHub API'den veriler alınamadı. Kullanıcı adı ve repo adını kontrol edin.");
            }
            // Gelen veriyi JSON formatına çevir
            return response.json();
        })
        .then(data => {
            // Gelen veri bir dizi (array). Bu diziyi filtrele:
            // Sadece 'file' (dosya) tipinde olanları ve uzantısı resim olanları al
            const imageFiles = data.filter(file => 
                file.type === "file" &&
                /\.(jpe?g|png|gif|webp)$/i.test(file.name) // Resim uzantılarını kontrol et
            );
            
            // Eğer filtreleme sonucu hiç resim bulunamazsa
            if (imageFiles.length === 0) {
                galleryContainer.innerHTML = `<p style="color: #ccc;">'${imageFolderPath}' klasöründe hiç resim bulunamadı. Lütfen resim yükleyin.</p>`;
                return;
            }

            // Bulunan her resim dosyası için galeriye bir <img> elementi ekle
            imageFiles.forEach(file => {
                const img = document.createElement("img");
                img.src = file.download_url; // Resmin direkt indirme linki (en hızlısı)
                img.alt = file.name; // Resim yüklenmezse görünecek alternatif metin

                // Galeri resmine tıklandığında lightbox'ı aç
                img.addEventListener("click", () => {
                    openLightbox(file.download_url, file.name);
                });

                // Oluşturulan <img> elementini galeriye ekle
                galleryContainer.appendChild(img);
            });
        })
        .catch(error => {
            // Bir hata oluşursa (API hatası, klasör bulunamama vb.)
            console.error("Hata:", error);
            galleryContainer.innerHTML = `<p style="color: #f00;">Galeri yüklenirken bir hata oluştu: ${error.message}</p>`;
        });

    // Lightbox'ı açan fonksiyon
    function openLightbox(imageUrl, imageName) {
        lightboxImage.src = imageUrl; // Tıklanan resmin URL'sini lightbox'a ata
        downloadBtn.href = imageUrl; // İndirme tuşunun linkini ayarla
        downloadBtn.download = imageName; // İndirilen dosyanın adını ayarla
        lightbox.style.display = "flex"; // Lightbox'ı görünür yap
    }

    // Lightbox'ı kapatan fonksiyon
    function closeLightbox() {
        lightbox.style.display = "none"; // Lightbox'ı gizle
    }

    // Kapatma (X) tuşuna basınca kapat
    closeBtn.addEventListener("click", closeLightbox);

    // Resmin dışındaki boş alana (arka plana) tıklayınca kapat
    lightbox.addEventListener("click", function(event) {
        // Eğer tıklanan yer tam olarak lightbox'ın kendisiyse (resim değilse)
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

});