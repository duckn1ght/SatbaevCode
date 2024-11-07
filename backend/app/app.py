from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import cv2
from deepface import DeepFace
from datetime import datetime

app = Flask(__name__)

# Настройки для Flask
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # Максимум 8 МБ для загрузок

# Создание папки для загрузок, если она не существует
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Главный маршрут для загрузки изображения
@app.route('/api/upload', methods=['POST'])
def api_upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "Файл не предоставлен"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Файл не выбран"}), 400

    allowed_extensions = {'png', 'jpg', 'jpeg'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Недопустимый тип файла"}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # Используем DeepFace для анализа изображения
        result = DeepFace.analyze(file_path, actions=['age', 'gender', 'emotion'], enforce_detection=False)

        # Получаем результаты анализа
        age = result[0]['age']
        gender = result[0]['dominant_gender']
        dominant_emotion = result[0]['dominant_emotion']

        return jsonify({
            "message": "Изображение успешно загружено",
            "filename": filename,
            "age": age,
            "gender": gender,
            "dominant_emotion": dominant_emotion
        }), 201
    except Exception as e:
        return jsonify({"error": f"Ошибка анализа изображения: {str(e)}"}), 400

# Главная страница (для теста, если нужно)
@app.route('/')
def index():
    return "Welcome to the DeepFace Flask API!"

if __name__ == '__main__':
    app.run(debug=True)
