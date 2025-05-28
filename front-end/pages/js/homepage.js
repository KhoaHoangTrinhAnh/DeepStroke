document.addEventListener("DOMContentLoaded", () => {
    // Xoá dữ liệu quizz và kết quả dự đoán cũ
    localStorage.removeItem('quizData');
    localStorage.removeItem('predictionResult');

    const selfieInput = document.getElementById("selfieInput");
    const previewContainer = document.getElementById("preview-container");
    const previewImage = document.getElementById("preview-image");
    const removeBtn = document.getElementById("remove-btn");
    const startQuizBtn = document.getElementById("startQuizBtn");

    // Nếu trang reload mà đã có ảnh trong localStorage thì hiển thị preview luôn
    const savedImage = localStorage.getItem("selfieImage");
    if (savedImage) {
        previewImage.src = savedImage;
        previewContainer.style.display = "flex";
    }

    selfieInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) {
            // Ẩn preview nếu không có file
            previewContainer.style.display = "none";
            localStorage.removeItem("selfieImage");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
        // Lưu dưới dạng Base64 vào localStorage
            const base64 = e.target.result;
            localStorage.setItem("selfieImage", base64);

            previewImage.src = base64;
            previewContainer.style.display = "flex";
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener("click", () => {
        selfieInput.value = "";          // Reset input file
        previewImage.src = "";
        previewContainer.style.display = "none";
        localStorage.removeItem("selfieImage");
    });

    startQuizBtn.addEventListener("click", () => {
        const selfie = localStorage.getItem("selfieImage");
        if (!selfie) {
        alert("Vui lòng upload ảnh selfie trước khi làm quizz!");
        return;
        }
        window.location.href = "quizz.html";
    });

    //==========Liên quan đến giao diện, không xoá===========
    const quoteSection = document.querySelector(".quote-section");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                quoteSection.classList.add("show");
            }
        });
    }, { threshold: 0.5 });

    observer.observe(quoteSection);
});