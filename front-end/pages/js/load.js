document.addEventListener("DOMContentLoaded", function () {
  const quizzData = JSON.parse(localStorage.getItem("quizData"));
  const imageData = localStorage.getItem("selfieImage");

  if (!quizzData || !imageData) {
    alert("Không tìm thấy dữ liệu để dự đoán.");
    window.location.href = "homepage.html";
    return;
  }

  // Ghép quiz data và ảnh thành một object
  const requestBody = {
    ...quizzData,             // trải các trường câu hỏi trắc nghiệm
    image_base64: imageData   // thêm trường ảnh base64
  };

  fetch("http://localhost:5000/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API");
      }
      return response.json();
    })
    .then(data => {
      // Lưu kết quả đơn giản gồm prediction và average_probability
      const resultToStore = {
        prediction: data.prediction,
        average_probability: data.average_probability
      };
      localStorage.setItem("predictionResult", JSON.stringify(resultToStore));
      window.location.href = "result.html";
    })
    .catch(error => {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi khi gửi dữ liệu đến API.");
    });
});