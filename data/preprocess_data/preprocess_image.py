import os
import cv2
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

# Đường dẫn đến thư mục chứa ảnh
stroke_folder = "D:/Năm 3 - HK2/Dữ liệu lớn/DeepStroke/data/raw/stroke_data"
nostroke_folder = "D:/Năm 3 - HK2/Dữ liệu lớn/DeepStroke/data/raw/noStroke_data"

# Hàm tiền xử lý ảnh
def preprocess_image(image_path):
    # Đọc ảnh
    image = cv2.imread(image_path)
    
    # Chuyển ảnh về màu xám (grayscale) nếu cần
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Resize ảnh về kích thước chuẩn, ví dụ 224x224
    image_resized = cv2.resize(image_gray, (224, 224))
    
    # Chuẩn hóa giá trị pixel về [0, 1]
    image_normalized = image_resized / 255.0
    
    # Thêm chiều cho ảnh (thành (1, 224, 224, 1) cho CNN)
    image_expanded = np.expand_dims(image_normalized, axis=-1)
    
    return image_expanded

# Tiền xử lý ảnh trong thư mục
def process_images_in_folder(folder_path):
    images = []
    labels = []
    for label, folder in enumerate([stroke_folder, nostroke_folder]):
        for image_name in os.listdir(folder):
            image_path = os.path.join(folder, image_name)
            image = preprocess_image(image_path)
            images.append(image)
            labels.append(label)
    
    return np.array(images), np.array(labels)

# Tiền xử lý ảnh và lấy dữ liệu
images, labels = process_images_in_folder("dataset")

# Tạo bộ dữ liệu huấn luyện với ImageDataGenerator (cho augmentation nếu cần)
datagen = ImageDataGenerator(rotation_range=20, width_shift_range=0.2, height_shift_range=0.2,
                             shear_range=0.2, zoom_range=0.2, horizontal_flip=True)

# Hiển thị một ảnh ví dụ đã tiền xử lý
plt.imshow(images[0].reshape(224, 224), cmap='gray')
plt.show()
