document.addEventListener("DOMContentLoaded", function () {
  const rawData = JSON.parse(localStorage.getItem("rawPredictionData"));

  if (!rawData) {
    alert("❌ Không tìm thấy dữ liệu để dự đoán.");
    window.location.href = "index.html";
    return;
  }

  fetch("http://localhost:5000/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("❌ Lỗi khi gọi API");
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ Kết quả dự đoán:", data);
      localStorage.setItem("predictionResult", JSON.stringify(data));
      window.location.href = "result.html";
    })
    .catch(error => {
      console.error("❌ Lỗi:", error);
      alert("Đã xảy ra lỗi khi gửi dữ liệu đến API.");
    });
});