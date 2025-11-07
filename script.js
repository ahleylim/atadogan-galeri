
document.addEventListener("DOMContentLoaded", function() {

   

    
    const githubUsername = "ahleylim"; 

     
    const githubRepo = "atadogan-galeri"; 

    
    const imageFolderPath = "resimler"; 

   


    
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${imageFolderPath}`;

    
    const galleryContainer = document.getElementById("gallery-container");
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImage = document.getElementById("lightbox-image");
    const closeBtn = document.querySelector(".lightbox-close");
    const downloadBtn = document.getElementById("download-button");

    
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

    
    function openLightbox(imageUrl, imagePath) { 
      
        lightboxImage.src = imageUrl; 
        
       
        downloadBtn.href = imagePath;  
        
        
        const imageName = imagePath.split('/').pop();  
        downloadBtn.download = imageName; 
        
        lightbox.style.display = "flex";
    }

   
    function closeLightbox() {
        lightbox.style.display = "none";
    }

   
    closeBtn.addEventListener("click", closeLightbox);

    
    lightbox.addEventListener("click", function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

});

