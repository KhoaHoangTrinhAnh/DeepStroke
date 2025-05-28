from flask import Flask, request, jsonify
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
import os
from flask_cors import CORS
from pyspark.sql import functions as F
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import base64
import io
from io import BytesIO
import re

os.environ['PYSPARK_PYTHON'] = 'python'
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB, điều chỉnh theo nhu cầu

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
print(f"🔄 Đang load model Logistic RegressionModel từ: {model_path}")
model = PipelineModel.load(model_path)
print("✅ Model Logistic RegressionModel đã được load thành công.")

# Đường dẫn model VGG16
vgg_model_path = os.path.join(current_dir, "models", "vgg16_model.h5")
print(f"🔄 Đang load model VGG16 từ: {vgg_model_path}")
vgg_model = load_model(vgg_model_path)
print("✅ Model VGG16 đã được load thành công.")

def preprocess_image(image_base64):
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image = image.resize((224, 224))  # Kích thước chuẩn của VGG16
        image_array = np.array(image) / 255.0
        return np.expand_dims(image_array, axis=0)  # (1, 224, 224, 3)
    except Exception as e:
        raise ValueError(f"Error processing image: {str(e)}")

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
        result_row = model.transform(df).take(1)[0]
        spark_prob = float(result_row.probability[1])
        print(f"✅ Model Logistic RegressionModel dự đoán xác suất là: {spark_prob}")

        # ==== 2. Tiền xử lý ảnh và dự đoán bằng VGG16 model ====
        image_base64 = data.get("image_base64", None)
        if image_base64 is None:
            raise ValueError("Không nhận được ảnh (image_base64).")
        
        processed_image = preprocess_image(image_base64)
        vgg_prob = float(vgg_model.predict(processed_image)[0][0])  # giả sử output là sigmoid
        print(f"✅ model VGG16 dự đoán xác suất là: {vgg_prob}")

        # ==== 3. Trung bình kết quả ====
        avg_prob = (spark_prob + vgg_prob) / 2
        prediction = 1.0 if avg_prob >= 0.5 else 0.0

        label_map = {0.0: "Low Risk", 1.0: "High Risk"}
        result = {
            "prediction": label_map[prediction],
            "average_probability": round(avg_prob * 100, 2),
            "spark_probability": round(spark_prob * 100, 2),
            "vgg_probability": round(vgg_prob * 100, 2),
        }

        print(f"📤 Kết quả dự đoán gửi về client: {result}")
        return jsonify(result)

    except Exception as e:
        print("❌ Lỗi khi dự đoán:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Flask API đang chạy...")
    app.run(host='0.0.0.0', port=5000, debug=True)