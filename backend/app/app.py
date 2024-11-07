from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///IMAGES.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Максимум 16 МБ для загрузок

db = SQLAlchemy(app)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Image {self.filename}>"

# Убедитесь, что папка для загрузки существует
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/api/upload', methods=['POST'])
def api_upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "Файл не предоставлен"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Файл не выбран"}), 400

    # Проверка разрешенных типов файлов (например, только изображения jpg, png)
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Недопустимый тип файла"}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    new_image = Image(filename=filename)
    db.session.add(new_image)
    db.session.commit()
    
    return jsonify({"message": "Изображение успешно загружено", "filename": filename}), 201

@app.route('/api/images', methods=['GET'])
def api_get_images():
    images = Image.query.all()
    image_list = [{"id": image.id, "filename": image.filename, "upload_date": image.upload_date} for image in images]
    return jsonify(image_list), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
