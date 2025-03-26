document.addEventListener("DOMContentLoaded", function() {
    // Lấy điểm nguy cơ từ URL
    const urlParams = new URLSearchParams(window.location.search);
    let riskScore = parseInt(urlParams.get("score")) || 0;

    let progressBar = document.getElementById("progress-bar");
    let riskLevelText = document.getElementById("risk-level");
    let adviceText = document.getElementById("advice-text");

    // Cập nhật thanh tiến trình
    progressBar.style.width = riskScore + "%";

    // Xác định mức độ nguy cơ
    if (riskScore < 30) {
        progressBar.style.background = "green";
        riskLevelText.innerText = "Nguy cơ thấp 🟢";
        adviceText.innerText = "Sức khỏe tốt, hãy tiếp tục duy trì lối sống lành mạnh!";
    } else if (riskScore < 70) {
        progressBar.style.background = "orange";
        riskLevelText.innerText = "Nguy cơ trung bình 🟠";
        adviceText.innerText = "Hãy tập thể dục thường xuyên và kiểm tra sức khỏe định kỳ.";
    } else {
        progressBar.style.background = "red";
        riskLevelText.innerText = "Nguy cơ cao 🔴";
        adviceText.innerText = "Hãy gặp bác sĩ để kiểm tra ngay! Duy trì chế độ ăn uống lành mạnh.";
    }
});
