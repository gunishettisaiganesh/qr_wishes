import os
import uuid
import base64
import json
import io
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
import qrcode
from PIL import Image

app = Flask(__name__)

# Configurations
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB Max upload size

# Create directories if they do not exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to check file type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Base64 Encoding & Decoding Helpers
def encode_data(payload):
    json_str = json.dumps(payload)
    return base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('utf-8').rstrip('=')

def decode_data(b64_str):
    # Add back base64 padding if stripped
    padding = len(b64_str) % 4
    if padding:
        b64_str += '=' * (4 - padding)
    json_bytes = base64.urlsafe_b64decode(b64_str.encode('utf-8'))
    return json.loads(json_bytes.decode('utf-8'))

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        if not name or not email or not message:
            return jsonify({'success': False, 'message': 'All fields are required.'}), 400
        return jsonify({'success': True, 'message': 'Your message has been sent successfully!'})
    return render_template('contact.html')

@app.route('/generate')
def generate():
    return render_template('generate.html')

@app.route('/api/generate', methods=['POST'])
def api_generate():
    try:
        friend_name = request.form.get('friend_name')
        sender_name = request.form.get('sender_name')
        message = request.form.get('message')
        age = request.form.get('age')
        birthday_date = request.form.get('birthday_date')
        theme = request.form.get('theme', 'royal-gold')
        music = request.form.get('music', 'happy-birthday')
        
        # Validation
        if not friend_name or not sender_name or not message:
            return jsonify({'success': False, 'error': 'Friend Name, Sender Name, and Birthday Message are required.'}), 400
        
        # Handle Uploads
        friend_photo_path = None
        bg_photo_path = None
        
        # Generate a unique hash prefix for files to prevent collisions
        file_hash = str(uuid.uuid4())[:8]
        
        friend_photo = request.files.get('photo')
        if friend_photo and friend_photo.filename != '':
            if allowed_file(friend_photo.filename):
                filename = secure_filename(f"{file_hash}_friend_{friend_photo.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                friend_photo.save(file_path)
                friend_photo_path = f"/static/uploads/{filename}"
            else:
                return jsonify({'success': False, 'error': 'Invalid format for friend photo. Allowed formats: PNG, JPG, JPEG, GIF, WEBP.'}), 400

        bg_photo = request.files.get('background')
        if bg_photo and bg_photo.filename != '':
            if allowed_file(bg_photo.filename):
                filename = secure_filename(f"{file_hash}_bg_{bg_photo.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                bg_photo.save(file_path)
                bg_photo_path = f"/static/uploads/{filename}"
            else:
                return jsonify({'success': False, 'error': 'Invalid format for background photo. Allowed formats: PNG, JPG, JPEG, GIF, WEBP.'}), 400

        # Construct short keys for JSON payload to keep URL string length small
        payload = {
            'fn': friend_name,
            'sn': sender_name,
            'msg': message,
            'age': int(age) if age else None,
            'date': birthday_date,
            'theme': theme,
            'music': music,
            'photo': friend_photo_path,
            'bg': bg_photo_path,
            'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Encode payload into safe base64
        data_string = encode_data(payload)
        wish_link = f"{request.host_url}wish/{data_string}"
        qr_image_route = f"/api/qr/{data_string}"
        
        return jsonify({
            'success': True,
            'data_string': data_string,
            'wish_link': wish_link,
            'qr_image': qr_image_route
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/result/<data_string>')
def result(data_string):
    try:
        # Decode data string to populate result details
        payload = decode_data(data_string)
        wish = {
            'id': data_string,
            'friend_name': payload.get('fn'),
            'sender_name': payload.get('sn'),
            'theme': payload.get('theme'),
            'wish_link': f"{request.host_url}wish/{data_string}",
            'qr_image': f"/api/qr/{data_string}"
        }
        return render_template('result.html', wish=wish)
    except Exception as e:
        return render_template('index.html', error="Invalid QR Wish link.")

@app.route('/wish/<data_string>')
def view_wish(data_string):
    try:
        # Decode directly from URL string
        payload = decode_data(data_string)
        wish = {
            'id': data_string,
            'friend_name': payload.get('fn'),
            'sender_name': payload.get('sn'),
            'message': payload.get('msg'),
            'age': payload.get('age'),
            'birthday_date': payload.get('date'),
            'theme': payload.get('theme'),
            'music': payload.get('music'),
            'photo': payload.get('photo'),
            'background': payload.get('bg')
        }
        return render_template('wish.html', wish=wish)
    except Exception as e:
        return redirect(url_for('index'))

@app.route('/api/qr/<data_string>')
def dynamic_qr(data_string):
    try:
        # Decode payload to determine custom color matching
        payload = decode_data(data_string)
        theme = payload.get('theme', 'royal-gold')
        
        # Color match map
        theme_colors = {
            'birthday-blue': ('#0066cc', 'white'),
            'pink-party': ('#ff3388', 'white'),
            'royal-gold': ('#cc9900', 'white'),
            'dark-neon': ('#00ffcc', '#121212'),
            'cute-cartoon': ('#ff6600', 'white'),
            'minimal-white': ('#111111', 'white')
        }
        fill_c, back_c = theme_colors.get(theme, ('#cc9900', 'white'))
        
        # Generate QR code directed to raw wish link
        wish_link = f"{request.host_url}wish/{data_string}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4
        )
        qr.add_data(wish_link)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color=fill_c, back_color=back_c)
        
        # Send raw bytes as file response directly from RAM
        img_io = io.BytesIO()
        qr_img.save(img_io, 'PNG')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png')
    except Exception as e:
        return "Failed to generate QR code", 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
