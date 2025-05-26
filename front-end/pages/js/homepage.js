document.addEventListener("DOMContentLoaded", function () {
  const selfieInput = document.getElementById("selfieInput");
  const startQuizBtn = document.getElementById("startQuizBtn");

  selfieInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        localStorage.setItem("selfieImageBase64", reader.result);
      };
      reader.readAsDataURL(file);
    }
  });

  startQuizBtn.addEventListener("click", function () {
    if (!localStorage.getItem("selfieImageBase64")) {
      alert("Vui lòng upload ảnh trước khi làm quiz.");
      return;
    }
    window.location.href = "quizz.html";
  });



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
