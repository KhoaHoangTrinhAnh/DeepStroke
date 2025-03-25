document.querySelector("button[type='submit']").addEventListener("click", function(event) {
    event.preventDefault(); // Ngăn chặn reload trang

    const formData = new FormData(document.querySelector("form"));
    let result = {};

    for (const [key, value] of formData.entries()) {
        result[key] = value;
    }

    console.log("Kết quả:", result);

    alert("🎉 Bạn đã hoàn thành quizz! Cùng chờ xem kết quả nhé!");
});
