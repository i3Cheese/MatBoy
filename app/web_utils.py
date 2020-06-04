from flask import Blueprint, request, url_for
from flask import make_response, jsonify
from flask_login import login_required, current_user
from data import User, Tournament, Post, create_session
from string import ascii_letters, digits
from random import choice


blueprint = Blueprint('web_utils', __name__)

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


@blueprint.route('/subscribe-email', methods=['POST'])
@login_required
def subscribe_email():
    try:
        if 'status' in request.form and 'tour_id' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            tour_id = request.form.get('tour_id')
            tour = session.query(Tournament).get(tour_id)
            user = session.query(User).get(current_user.id)
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
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})


@blueprint.route('/subscribe-vk', methods=['POST'])
@login_required
def subscribe_vk():
    try:
        if 'status' in request.form and 'tour_id' in request.form:
            session = create_session()
            status = request.form.get('status')
            status = bool(int(status))
            tour_id = request.form.get('tour_id')
            tour = session.query(Tournament).get(tour_id)
            user = session.query(User).get(current_user.id)
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
            session.commit()
            return jsonify({'success': 'ok'})
        else:
            raise AttributeError
    except AttributeError:
        return jsonify({'error': 'Invalid response'})