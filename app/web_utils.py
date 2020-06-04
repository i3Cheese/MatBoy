from flask import Blueprint, request, url_for, make_response, jsonify
from flask_login import login_required, current_user
from data import User, Tournament, create_session
from string import ascii_letters, digits
from random import choice
from app.forms import EditPassword

blueprint = Blueprint('web_utils', __name__)


@blueprint.route('/edit-password', methods=['POST'])
@login_required
def edit_password():
    edit_password_form = EditPassword()
    if edit_password_form.validate_on_submit():
        session = create_session()
        password = edit_password_form.password.data
        user = session.query(User).get(current_user.id)
        user.set_password(password)
        session.commit()
        return make_response(jsonify({'success': 'ok'}), 200)
    else:
        return make_response(jsonify(edit_password_form.errors), 400)


@blueprint.route('/upload-image', methods=['POST'])
@login_required
def upload_image_creator():
    """Load images from ck-editor"""
    image = request.files.get('upload')
    type_img = image.filename.split('.')[-1]
    filename = ''.join(choice(ascii_letters + digits) for _ in range(50)) + '.' + type_img
    url_image = './static/img/' + filename
    image.save(url_image)
    return make_response(jsonify({
        'uploaded': 1,
        'fileName': filename,
        'url': url_for('static', filename='img/{0}'.format(filename))
    }))


@blueprint.route('/subscribe-email-tour', methods=['POST'])
@blueprint.route('/subscribe-email-profile', methods=['POST'])
@login_required
def subscribe_email():
    try:
        if 'status' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            user = session.query(User).get(current_user.id)
            if request.path == '/subscribe-email-tour' and 'tour_id' in request.form:
                tour_id = request.form.get('tour_id')
                tour = session.query(Tournament).get(tour_id)
                if not tour:
                    raise AttributeError
                if status:
                    if user not in tour.users_subscribe_email:
                        tour.users_subscribe_email.append(user)
                else:
                    if user in tour.users_subscribe_email:
                        tour.users_subscribe_email.remove(user)
                session.merge(tour)
                session.merge(user)
            elif request.path == '/subscribe-email-profile':
                if status:
                    user.email_notifications = True
                else:
                    user.email_notifications = False
            else:
                raise AttributeError
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})


@blueprint.route('/subscribe-vk-tour', methods=['POST'])
@blueprint.route('/subscribe-vk-profile', methods=['POST'])
@login_required
def subscribe_vk():
    try:
        if 'status' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            user = session.query(User).get(current_user.id)
            if request.path == '/subscribe-vk-tour' and 'tour_id' in request.form:
                tour_id = request.form.get('tour_id')
                tour = session.query(Tournament).get(tour_id)
                if not tour:
                    raise AttributeError
                if status:
                    if user not in tour.users_subscribe_vk:
                        tour.users_subscribe_vk.append(user)
                else:
                    if user in tour.users_subscribe_vk:
                        tour.users_subscribe_vk.remove(user)
                session.merge(tour)
                session.merge(user)
            elif request.path == '/subscribe-vk-profile':
                if status:
                    user.vk_notifications = True
                else:
                    user.vk_notifications = False
            else:
                raise AttributeError
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})
