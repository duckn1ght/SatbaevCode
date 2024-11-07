from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.file import FileField, FileRequired, FileAllowed
from werkzeug.utils import secure_filename
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///IMAGES.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Image {self.filename}>"

@app.route('/api/upload', methods=['POST'])
def api_upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    new_image = Image(filename=filename)
    db.session.add(new_image)
    db.session.commit()
    
    return jsonify({"message": "Image uploaded successfully", "filename": filename}), 201

@app.route('/api/images', methods=['GET'])
def api_get_images():
    images = Image.query.all()
    image_list = [{"id": image.id, "filename": image.filename, "upload_date": image.upload_date} for image in images]
    return jsonify(image_list), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
