from flask import Flask, request, jsonify
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
import os
from flask_cors import CORS
from pyspark.sql import functions as F

os.environ['PYSPARK_PYTHON'] = 'python'
app = Flask(__name__)

CORS(app)

# Khởi tạo Spark session
print("🔄 Đang khởi tạo Spark session...")
spark = SparkSession.builder \
    .appName("StrokeRiskPrediction") \
    .config("spark.executor.memory", "2g") \
    .config("spark.driver.memory", "2g") \
    .config("spark.executor.cores", "1") \
    .config("spark.python.worker.faulthandler.enabled", "true") \
    .config("spark.sql.execution.pyspark.udf.faulthandler.enabled", "true") \
    .getOrCreate()

# spark = SparkSession.builder.appName("StrokeRiskPrediction").getOrCreate()
print("✅ Spark session đã được khởi tạo.")

# Đường dẫn tới model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "models", "Model_LogisticRegression")

# Load PipelineModel thay vì LogisticRegressionModel
print(f"🔄 Đang load model từ: {model_path}")
model = PipelineModel.load(model_path)
print("✅ Model đã được load thành công.")

@app.route('/api/predict', methods=['POST'])
def predict():
    print("\n📥 Nhận yêu cầu dự đoán từ client...")
    data = request.json
    if not data:
        print("❌ Không nhận được dữ liệu đầu vào.")
        return jsonify({"error": "No input data received"}), 400
    print("Dữ liệu nhận được từ client:", data)

    try:
        input_columns = ['Sex','GeneralHealth','HeightInMeters','WeightInKilograms','BMI',
        'HadHeartAttack','HadAngina','HadStroke','HadAsthma','HadSkinCancer','HadCOPD',
        'HadDepressiveDisorder','HadKidneyDisease','HadArthritis','DeafOrHardOfHearing',
        'BlindOrVisionDifficulty','DifficultyConcentrating','DifficultyWalking',
        'DifficultyDressingBathing','DifficultyErrands','SmokerStatus','ECigaretteUsage',
        'ChestScan','AlcoholDrinkers','HIVTesting','FluVaxLast12','PneumoVaxEver',
        'HighRiskLastYear','CovidPos','AgeMin','AgeMax','TetanusLast10TdapIndex',
        'HadDiabetesIndex']

        # Tạo Spark DataFrame từ dữ liệu đầu vào
        df = spark.createDataFrame([[data[col] for col in input_columns]], input_columns)
        print("✅ Dữ liệu đã được chuyển thành DataFrame.")
        df.printSchema()

        print("🔍 Đang chạy pipeline transform + dự đoán...")
        result_row = model.transform(df).take(1)[0]

        prediction = result_row.prediction
        probability = result_row.probability[1]  # Xác suất nhãn 1 (có nguy cơ cao)

        label_map = {0.0: "Low Risk", 1.0: "High Risk"}

        result = {
            "prediction": label_map.get(prediction, str(prediction)),
            "probability": round(float(probability) * 100, 2)
        }

        print(f"📤 Kết quả dự đoán gửi về client: {result}")
        return jsonify(result)

    except Exception as e:
        print("❌ Lỗi khi dự đoán:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Flask API đang chạy...")
    app.run(host='0.0.0.0', port=5000, debug=True)