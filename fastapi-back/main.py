from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
import base64
import os
import numpy as np
from deepface import DeepFace

app = FastAPI()

# Добавляем поддержку CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники (или укажите конкретные URL)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Папка для сохранения изображений
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic модель для получения данных из тела запроса
class ImageData(BaseModel):
    image_data: str

# Маршрут для приема изображения в формате Base64
@app.post("/upload/")
async def upload_image(data: ImageData):
    try:
        # Извлекаем строку Base64 из тела запроса
        image_data = data.image_data
        
        # Убираем префикс "data:image/jpeg;base64," если он есть
        if image_data.startswith("data:image/jpeg;base64,"):
            image_data = image_data.replace("data:image/jpeg;base64,", "")
        
        # Декодируем строку Base64 в байты
        image_bytes = base64.b64decode(image_data)
        
        # Преобразуем байты в изображение с помощью Pillow
        image = Image.open(BytesIO(image_bytes))
        
        # Генерация уникального имени для файла
        file_path = os.path.join(UPLOAD_DIR, "uploaded_image.jpg")
        
        # Сохраняем изображение в директории
        image.save(file_path)

        result = analyzeImage(image_path=file_path)

        print(result["age"])
        
        return '{'f"age: {result['age']}, emotion: {result['dominant_emotion']}, gender: {result["dominant_gender"]}"'}'

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def analyzeImage(image_path):
    image = Image.open(image_path)

    image_np = np.array(image)

    result = DeepFace.analyze(image_np, actions=['emotion', 'age', 'gender'])

    return result[0]