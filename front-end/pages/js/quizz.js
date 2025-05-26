    function nextStep(step) {
        document.querySelectorAll('.quiz-step').forEach(el => el.style.display = 'none');
        document.getElementById(`step-${step}`).style.display = 'block';
    }
    function prevStep(step) {
        document.querySelectorAll('.quiz-step').forEach(el => el.style.display = 'none');
        document.getElementById(`step-${step}`).style.display = 'block';
    }
    document.getElementById("quiz-form").addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "load.html";
    });

// Xoá dữ liệu và kết quả cũ đã lưu
document.addEventListener("DOMContentLoaded", () => {
   localStorage.removeItem('rawPredictionData');
   localStorage.removeItem('predictionResult');
});

// Hàm chuyển đổi loại dữ liệu:
  function transformFormData(rawData) {
      const sexMap = { male: 1, female: 0 };
      const generalHealthMap = {
        "Rất tốt": 4,
        "Tốt": 3,
        "Trung bình": 2,
        "Kém": 1,
        "Rất kém": 0
      };

      function yesNoToBinary(value) {
        if (!value) return 0;
        const val = value.toString().toLowerCase();
        return (val === 'yes' || val === 'có' || val === 'đúng') ? 1 : 0;
      }

      const smokingMap = {
        "Không hút thuốc": 0,
        "Hút thuốc một vài ngày": 1,
        "Hút thuốc hàng ngày": 2,
        "Đã bỏ thuốc": 3
      };

      if (!rawData.height || !rawData.weight) {
        console.error("Thiếu chiều cao hoặc cân nặng!");
        return null;
      }

      const ageMatch = rawData.age.match(/(\d+)\s+đến\s+(\d+)/);
      const ageMin = ageMatch ? parseInt(ageMatch[1]) : null;
      const ageMax = ageMatch ? parseInt(ageMatch[2]) : null;

      const heightMeters = rawData.height ? Number(rawData.height) : null;
      const weightKg = rawData.weight ? Number(rawData.weight) : null;

      // ✅ GIỮ GIÁ TRỊ GỐC CỦA BMI
      const rawBmi = (heightMeters && weightKg) ? (weightKg / (heightMeters * heightMeters)) : null;

      const transformed = {
        Sex: sexMap[rawData.sex.toLowerCase()] ?? 0,
        GeneralHealth: generalHealthMap[rawData.GeneralHealth] ?? 0,
        HeightInMeters: heightMeters ?? 0,             // ✅ giữ nguyên giá trị
        WeightInKilograms: weightKg ?? 0,              // ✅ giữ nguyên giá trị
        BMI: rawBmi ?? 0,                              // ✅ giữ nguyên giá trị
        HadHeartAttack: yesNoToBinary(rawData.heartattack),
        HadAngina: yesNoToBinary(rawData.angina),
        HadStroke: 0,
        HadAsthma: yesNoToBinary(rawData.asthma),
        HadSkinCancer: yesNoToBinary(rawData.skincancer),
        HadCOPD: yesNoToBinary(rawData.copd),
        HadDepressiveDisorder: yesNoToBinary(rawData.depression),
        HadKidneyDisease: yesNoToBinary(rawData.kidney),
        HadArthritis: yesNoToBinary(rawData.arthritis),
        DeafOrHardOfHearing: yesNoToBinary(rawData.deaf),
        BlindOrVisionDifficulty: yesNoToBinary(rawData.blind),
        DifficultyConcentrating: yesNoToBinary(rawData.concentrate),
        DifficultyWalking: yesNoToBinary(rawData.walking),
        DifficultyDressingBathing: yesNoToBinary(rawData.dressing),
        DifficultyErrands: yesNoToBinary(rawData.errands),
        SmokerStatus: smokingMap[rawData.smoking] ?? 0,
        ECigaretteUsage: rawData.eciga === "Chưa bao giờ sử dụng thuốc lá điện tử trong đời" ? 0 : 1,
        ChestScan: yesNoToBinary(rawData.ct),
        AlcoholDrinkers: yesNoToBinary(rawData.alcohol),
        HIVTesting: yesNoToBinary(rawData.hiv),
        FluVaxLast12: yesNoToBinary(rawData.flu12),
        PneumoVaxEver: 0,
        HighRiskLastYear: yesNoToBinary(rawData.risk),
        CovidPos: yesNoToBinary(rawData.covid),
        AgeMin: ageMin ?? 0,
        AgeMax: ageMax ?? 0,
        TetanusLast10TdapIndex: 0,
        HadDiabetesIndex: 0
      };
      return transformed;
  }

// Hàm lấy dữ liệu từ form thành JSON
  function getFormDataAsJSON() {
    const form = document.getElementById('quiz-form');
    const data = {};

    // Lấy tất cả input, select trong form
    const elements = form.querySelectorAll('input, select');
    elements.forEach(el => {
      const name = el.name || el.id;  // ưu tiên name, fallback id
      if (!name) return;

      if (el.type === 'radio') {
        if (el.checked) {
          data[name] = el.value;
        }
      } else if (el.tagName.toLowerCase() === 'select') {
        data[name] = el.value;
      } else if (el.type === 'text' || el.type === 'number') {
        data[name] = el.value;
      }
    });

    return data;
  }

  // Khi submit quiz (ví dụ ở bước cuối cùng bạn có nút submit)
  /*async function submitQuiz() {
    console.log("Submit quiz clicked");

    const rawData = getFormDataAsJSON();
    console.log('Dữ liệu gốc:', rawData);
    const jsonData = transformFormData(rawData);
    console.log('Dữ liệu gửi:', jsonData);
    let success = false;

    try {
    const response = await fetch('http://192.168.31.170:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) throw new Error('Lỗi mạng hoặc server');

    const result = await response.json();
    console.log("Kết quả từ server:", result);

    localStorage.setItem('predictionResult', JSON.stringify(result));
    success = true;

  } catch (err) {
    alert('Có lỗi khi gửi dữ liệu: ' + err.message);
  }
  // Chuyển trang nếu thành công
  if (success) {
    window.location.href = '../html/result.html';
  }
  }*/

document.getElementById("quiz-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const rawData = getFormDataAsJSON();
    console.log('Dữ liệu gốc:', rawData);
    const transformedData = transformFormData(rawData);
    console.log('Dữ liệu gửi:', transformedData);

    if (!transformedData) {
      alert("Dữ liệu không hợp lệ.");
      return;
    }

    localStorage.setItem("rawPredictionData", JSON.stringify(transformedData));
    window.location.href = "load.html";
});
