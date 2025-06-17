from flask import Blueprint, render_template, request, jsonify

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Placeholder: handle email submission and OTP sending
        return render_template('login.html', message='OTP sent (placeholder)')
    return render_template('login.html')

@main.route('/verify', methods=['POST'])
def verify():
    # Placeholder: handle OTP verification
    return jsonify({'status': 'OTP verification placeholder'})

@main.route('/api/form-submit', methods=['POST'])
def form_submit():
    data = request.json
    # TODO: validate & store in User.last_submitted_form_data
    return '', 204

@main.route('/api/notify', methods=['POST'])
def notify():
    # Placeholder for future integration
    return jsonify({'status': 'received'}), 200
