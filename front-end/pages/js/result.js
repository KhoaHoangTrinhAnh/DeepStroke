document.addEventListener("DOMContentLoaded", function() {
    const progressBar = document.getElementById("progress-bar");
    const riskLevelText = document.getElementById("risk-level");
    const adviceText = document.getElementById("advice-text");
    const progressPercent = document.getElementById("progress-percent");

    // Lấy kết quả dự đoán từ localStorage
    const result = JSON.parse(localStorage.getItem('predictionResult'));

    let riskScore = 0;
    if (result && typeof result.average_probability === 'number') {
        riskScore = result.average_probability;
    }

    // Giới hạn riskScore trong 0-100
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    // Cập nhật thanh tiến trình
    progressBar.style.width = riskScore + "%";
    progressPercent.innerText = riskScore.toFixed(2) + "%";
    progressBar.style.background = getRiskColor(riskScore);

    // Xác định mức độ nguy cơ dựa trên riskScore
    if (riskScore < 30) {
        riskLevelText.innerText = "Nguy cơ thấp";
        adviceText.innerText = "Sức khỏe tốt, hãy tiếp tục duy trì lối sống lành mạnh!";
    } else if (riskScore < 70) {
        riskLevelText.innerText = "Nguy cơ trung bình";
        adviceText.innerText = "Hãy tập thể dục thường xuyên và kiểm tra sức khỏe định kỳ.";
    } else {
        riskLevelText.innerText = "Nguy cơ cao";
        adviceText.innerText = "Hãy gặp bác sĩ để kiểm tra ngay! Duy trì chế độ ăn uống lành mạnh.";
    }

    // Hàm đổi màu thanh theo nguy cơ
    function getRiskColor(score) {
    let r, g, b = 0;

    if (score < 50) {
        // Xanh lá (0,200,0) -> Vàng (255,255,0)
        r = Math.round((score / 50) * 255);
        g = 200 + Math.round((score / 50) * (255 - 200));
        b = 0;
    } else {
        // Vàng (255,255,0) -> Đỏ (255,0,0)
        r = 255;
        g = Math.round(255 - ((score - 50) / 50) * 255);
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
    }
});