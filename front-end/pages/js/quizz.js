    function nextStep(step) {
        document.querySelectorAll('.quiz-step').forEach(el => el.style.display = 'none');
        document.getElementById(`step-${step}`).style.display = 'block';
    }
    function prevStep(step) {
        document.querySelectorAll('.quiz-step').forEach(el => el.style.display = 'none');
        document.getElementById(`step-${step}`).style.display = 'block';
    }

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

document.getElementById("quiz-form").addEventListener("submit", function(e) {
  e.preventDefault(); // Ngăn gửi form mặc định

  const rawData = getFormDataAsJSON();
  const transformedData = transformFormData(rawData);

  if (!transformedData) {
    alert("Dữ liệu nhập chưa đầy đủ hoặc không hợp lệ.");
    return;
  }

  localStorage.setItem("quizData", JSON.stringify(transformedData));

  // Hiển thị trang load
  window.location.href = "load.html";
});
